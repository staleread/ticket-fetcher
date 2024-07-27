import { NestFactory } from '@nestjs/core';
import { config as loadEnv } from 'dotenv';
import { AppModule } from './app.module';

const start = async () => {
  const port: number = Number(process.env.PORT) || 5000;
  const app = await NestFactory.create(AppModule);

  await app.listen(port);
};

loadEnv();
start();
