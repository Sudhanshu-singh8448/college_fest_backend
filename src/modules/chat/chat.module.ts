import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from '../../websocket/chat.gateway';

@Module({
  imports: [
    JwtModule.register({}),
    EventEmitterModule, // forwardRef not needed — root module registers it globally
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
