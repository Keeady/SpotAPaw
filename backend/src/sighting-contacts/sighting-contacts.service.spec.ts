import { Test, TestingModule } from '@nestjs/testing';
import { SightingContactsService } from './sighting-contacts.service.js';

describe('SightingContactsService', () => {
  let service: SightingContactsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SightingContactsService],
    }).compile();

    service = module.get<SightingContactsService>(SightingContactsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
