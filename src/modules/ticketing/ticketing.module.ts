import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TicketingService } from './ticketing.service';
import { TicketingController } from './ticketing.controller';

@Module({
  imports: [JwtModule.register({})],
  controllers: [TicketingController],
  providers: [TicketingService],
  exports: [TicketingService],
})
export class TicketingModule {}
