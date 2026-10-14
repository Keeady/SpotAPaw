import { Test, TestingModule } from '@nestjs/testing';
import { SightingContactsController } from './sighting-contacts.controller.js';
import { SightingContactsService } from './sighting-contacts.service.js';

describe('SightingContactsController', () => {
  let controller: SightingContactsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SightingContactsController],
      providers: [SightingContactsService],
    }).compile();

    controller = module.get<SightingContactsController>(SightingContactsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
