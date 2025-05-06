import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attachment, AttachmentType } from './entities/attachment.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Request } from 'express';
import { handleError } from 'src/utils/errorHandling';
import { ChannelsService } from 'src/channels/channels.service';
import { Message } from 'src/message/entities/message.entity';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,

    @InjectRepository(Message)
    private messageRepository: Repository<Message>,

    private readonly channelsService: ChannelsService,
  ) {}

  private readonly uploadPath = path.join(__dirname, '../../uploads');

  private bytesToMB(bytes: number): number {
    return parseFloat((bytes / (1024 * 1024)).toFixed(2));
  }

  async create(
    file: Express.Multer.File,
    createAttachmentDto: CreateAttachmentDto,
  ) {
    try {
      const { message_id, title, type } = createAttachmentDto;

      try {
        await fs.promises.access(this.uploadPath);
      } catch {
        await fs.promises.mkdir(this.uploadPath, { recursive: true });
      }

      const message = await this.messageRepository.findOne({
        where: { id: message_id },
      });

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      const allowedTypes: AttachmentType[] = [
        'image',
        'video',
        'file',
        'audio',
      ];
      if (!allowedTypes.includes(type)) {
        throw new BadRequestException(`Invalid attachment type: ${type}`);
      }

      const attachment = this.attachmentRepository.create({
        message: { id: message_id },
        title,
        type,
        url: path.join(this.uploadPath, file.filename),
        size: this.bytesToMB(file.size),
      });

      return await this.attachmentRepository.save(attachment);
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async findAllByChannel(channel_id: number, req: Request) {
    try {
      const user_id = req.user.userId;
      await this.channelsService.checkTheChannel(channel_id, user_id);

      const attachments = await this.attachmentRepository.find({
        where: {
          message: { channel: { id: channel_id } },
        },
        relations: {
          message: {
            channel: true,
            user: true,
          },
        },
        select: {
          message: {
            id: true,
            content: true,
            created_at: true,
            updated_at: true,
            user: {
              id: true,
              name: true,
              profile_photo: true,
            },
          },
          id: true,
          title: true,
          type: true,
          url: true,
          size: true,
        },
      });

      if (!attachments || attachments.length === 0) {
        throw new NotFoundException('Attachments not found');
      }

      return attachments;
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async findOneByChannel(
    channel_id: number,
    attachment_id: number,
    req: Request,
  ) {
    try {
      const user_id = req.user.userId;
      await this.channelsService.checkTheChannel(channel_id, user_id);

      const attachment = await this.attachmentRepository.findOne({
        where: {
          id: attachment_id,
          message: { channel: { id: channel_id } },
        },
        relations: {
          message: {
            channel: true,
            user: true,
          },
        },
      });

      if (!attachment) {
        throw new NotFoundException('Attachment not found');
      }

      return attachment;
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async remove(channel_id: number, attachment_id: number, req: Request) {
    const user_id = req.user.userId;
    await this.channelsService.checkTheChannel(channel_id, user_id);

    try {
      const attachment = await this.attachmentRepository.findOne({
        where: { id: attachment_id },
      });

      if (!attachment) {
        throw new NotFoundException(
          `Attachment with ID ${attachment_id} not found`,
        );
      }

      const filePath = attachment.url;
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      } else {
        throw new NotFoundException(
          `File with path ${filePath} does not exist`,
        );
      }

      await this.attachmentRepository.delete(attachment_id);

      return {
        message: `Attachment with ID ${attachment_id} deleted successfully.`,
      };
    } catch (error: unknown) {
      handleError(error);
    }
  }
}
