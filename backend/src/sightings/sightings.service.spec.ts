import { Test, TestingModule } from '@nestjs/testing';
import { SightingsService } from './sightings.service.js';

describe('SightingsService', () => {
  let service: SightingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SightingsService],
    }).compile();

    service = module.get<SightingsService>(SightingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
