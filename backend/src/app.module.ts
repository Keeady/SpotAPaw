import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SightingsModule } from './sightings/sightings.module.js';
import { PetsModule } from './pets/pets.module.js';
import { SightingContactsModule } from './sighting-contacts/sighting-contacts.module.js';
import { AggregatedSightingsModule } from './aggregated-sightings/aggregated-sightings.module.js';
import { UsersModule } from './users/users.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),
    SightingsModule,
    PetsModule,
    SightingContactsModule,
    AggregatedSightingsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
