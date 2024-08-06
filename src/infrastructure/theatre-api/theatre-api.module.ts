import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TheatreApiService } from './theatre-api.service';

@Module({
  imports: [ConfigModule],
  providers: [TheatreApiService],
  exports: [TheatreApiService],
})
export class TheatreApiModule {}
