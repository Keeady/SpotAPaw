import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module.js';

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
