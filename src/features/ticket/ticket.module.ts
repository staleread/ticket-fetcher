import { Module } from '@nestjs/common';
import { TheaterApiModule } from '../../infrastructure/theater-api/theater-api.module';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

@Module({
  imports: [TheaterApiModule],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
