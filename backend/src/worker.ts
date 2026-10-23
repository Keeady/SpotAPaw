import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
}

bootstrap().catch((err) => {
  console.error('worker bootstrap failed', err);
  throw err;
});
