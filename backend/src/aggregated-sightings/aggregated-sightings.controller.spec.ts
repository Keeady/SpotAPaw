import { Test, TestingModule } from '@nestjs/testing';
import { AggregatedSightingsController } from './aggregated-sightings.controller.js';
import { AggregatedSightingsService } from './aggregated-sightings.service.js';

describe('AggregatedSightingsController', () => {
  let controller: AggregatedSightingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AggregatedSightingsController],
      providers: [AggregatedSightingsService],
    }).compile();

    controller = module.get<AggregatedSightingsController>(AggregatedSightingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
