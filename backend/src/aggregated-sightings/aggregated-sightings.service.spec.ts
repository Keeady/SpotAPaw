import { Test, TestingModule } from '@nestjs/testing';
import { AggregatedSightingsService } from './aggregated-sightings.service.js';

describe('AggregatedSightingsService', () => {
  let service: AggregatedSightingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AggregatedSightingsService],
    }).compile();

    service = module.get<AggregatedSightingsService>(AggregatedSightingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
