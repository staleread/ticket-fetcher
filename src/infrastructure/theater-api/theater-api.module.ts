import { Module } from '@nestjs/common';
import { TheaterApiService } from './theater-api.service';

@Module({
  providers: [TheaterApiService],
  exports: [TheaterApiService],
})
export class TheaterApiModule {}
