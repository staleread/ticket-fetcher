import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TheaterApiService } from './theater-api.service';

@Module({
  imports: [ConfigModule],
  providers: [TheaterApiService],
  exports: [TheaterApiService],
})
export class TheaterApiModule {}
