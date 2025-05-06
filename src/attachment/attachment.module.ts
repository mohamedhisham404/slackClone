import { Module } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { AttachmentController } from './attachment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from './entities/attachment.entity';
import { UserChannel } from 'src/channels/entities/user-channel.entity';
import { Channels } from 'src/channels/entities/channel.entity';
import { ChannelsModule } from 'src/channels/channels.module';
import { Message } from 'src/message/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment, UserChannel, Channels, Message]),
    ChannelsModule,
  ],
  controllers: [AttachmentController],
  providers: [AttachmentService],
})
export class AttachmentModule {}
