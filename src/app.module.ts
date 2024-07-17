import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config/configuration';
import { TicketModule } from './features/ticket/ticket.module';
import { TheaterApiModule } from './infrastructure/theater-api/theater-api.module';

@Module({
  imports: [
    TicketModule,
    TheaterApiModule,
    ConfigModule.forRoot({
      load: [config],
    }),
  ],
})
export class AppModule {}
