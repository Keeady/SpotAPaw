import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { QueueModule } from './queue/queue.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), QueueModule],
})
class WorkerModule {}

/**
 * Standalone worker process: no HTTP server, separate from the API deployment.
 * Run: node dist/worker.js   (scale by running more replicas)
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks(); // SIGTERM -> consumers finish in-flight messages
}

bootstrap().catch((err) => {
  console.error('worker bootstrap failed', err);
  throw err;
});
