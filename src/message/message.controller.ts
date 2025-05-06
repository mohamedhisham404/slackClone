import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { MessageService } from './message.service';
import {
  CreateChannelMessageDto,
  CreateDMMessageDTO,
} from './dto/create-message.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guards';
import { UpdateMessageDto } from './dto/update-message.dto';

@UseGuards(AuthGuard)
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('channel')
  async createChannelMessage(
    @Body() CreateChannelMessageDto: CreateChannelMessageDto,
    @Req() req: Request,
  ) {
    return this.messageService.createChannelMessage(
      CreateChannelMessageDto,
      req,
    );
  }

  @Post('user')
  async createUserMessage(
    @Body() CreateDMMessageDTO: CreateDMMessageDTO,
    @Req() req: Request,
  ) {
    return this.messageService.createUserMessage(CreateDMMessageDTO, req);
  }

  @Get(':channelId')
  async getAllMessagesOfChannel(
    @Param('channelId', ParseIntPipe) channelId: number,
    @Req() req: Request,
    @Query('limit') limit = '20',
    @Query('page') page = '1',
  ) {
    // Convert to numbers and ensure fallback/default
    const parsedLimit = Math.max(1, parseInt(limit));
    const parsedPage = Math.max(1, parseInt(page));

    return this.messageService.getAllMessagesOfChannel(
      channelId,
      req,
      parsedLimit,
      parsedPage,
    );
  }

  @Get(':messageId/channel/:channelId')
  async findOne(
    @Param('messageId', ParseIntPipe) messageId: number,
    @Param('channelId', ParseIntPipe) channelId: number,
    @Req() req: Request,
  ) {
    return this.messageService.findOne(messageId, channelId, req);
  }

  @Patch(':messageId/channel/:channelId')
  async update(
    @Param('messageId', ParseIntPipe) messageId: number,
    @Param('channelId', ParseIntPipe) channelId: number,
    @Body() updateMessageDto: UpdateMessageDto,
    @Req() req: Request,
  ) {
    return this.messageService.update(
      messageId,
      channelId,
      updateMessageDto,
      req,
    );
  }

  @Delete(':messageId/channel/:channelId')
  async remove(
    @Param('messageId', ParseIntPipe) messageId: number,
    @Param('channelId', ParseIntPipe) channelId: number,
    @Req() req: Request,
  ) {
    return this.messageService.remove(messageId, channelId, req);
  }

  @Post('search/:channelId')
  async searchMessages(
    @Body('search') search: string,
    @Param('channelId', ParseIntPipe) channelId: number,
    @Req() req: Request,
  ) {
    return this.messageService.searchMessages(search, channelId, req);
  }

  @Post('date/:channelId')
  async getMessageByDate(
    @Body('date') date: string,
    @Param('channelId', ParseIntPipe) channelId: number,
    @Req() req: Request,
  ) {
    return this.messageService.getMessageByDate(date, channelId, req);
  }
}
