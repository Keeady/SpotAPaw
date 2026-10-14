import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  console.log('1. Starting NestJS');

  const app = await NestFactory.create(AppModule);

  console.log('2. NestJS initialized');

  await app.listen(process.env.PORT ?? 3000);

  console.log('3. NestJS listening');
}

bootstrap().catch((err) => {
  console.error('NestJS bootstrap failed', err);
  throw err;
});
