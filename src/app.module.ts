import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config/configuration';
import { TicketModule } from './features/ticket/ticket.module';
import { TheatreApiModule } from './infrastructure/theatre-api/theatre-api.module';

@Module({
  imports: [
    TicketModule,
    TheatreApiModule,
    ConfigModule.forRoot({
      load: [config],
    }),
  ],
})
export class AppModule {}
