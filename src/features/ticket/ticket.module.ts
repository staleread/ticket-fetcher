import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TheaterApiModule } from '../../infrastructure/theater-api/theater-api.module';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

@Module({
  imports: [ConfigModule, TheaterApiModule],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
