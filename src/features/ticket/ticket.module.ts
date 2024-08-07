import { Module } from '@nestjs/common';
import { TheatreApiModule } from '../../infrastructure/theatre-api/theatre-api.module';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

@Module({
  imports: [TheatreApiModule],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
