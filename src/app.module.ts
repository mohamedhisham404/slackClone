import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';
import { ChannelsModule } from './channels/channels.module';
import { MessageModule } from './message/message.module';
import { AttachmentModule } from './attachment/attachment.module';
import { EmojyModule } from './emojy/emojy.module';
import { NotificationWorkspaceModule } from './notification-workspace/notification-workspace.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { EventsModule } from './events/events.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
      global: true,
      inject: [ConfigService],
    }),
    DatabaseModule,
    UserModule,
    WorkspaceModule,
    UserPreferencesModule,
    ChannelsModule,
    MessageModule,
    AttachmentModule,
    EmojyModule,
    NotificationWorkspaceModule,
    AuthModule,
    EventsModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
