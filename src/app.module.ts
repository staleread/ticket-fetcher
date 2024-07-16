import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TicketModule } from './features/ticket/ticket.module';
import { TheaterApiModule } from './infrastructure/theater-api/theater-api.module';

@Module({
  imports: [ConfigModule.forRoot(), TicketModule, TheaterApiModule],
})
export class AppModule {}
