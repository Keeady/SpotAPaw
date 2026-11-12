import { Test, TestingModule } from '@nestjs/testing';
import { PetclaimsController } from './petclaims.controller.js';
import { PetclaimsService } from './petclaims.service.js';

describe('PetclaimsController', () => {
  let controller: PetclaimsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetclaimsController],
      providers: [PetclaimsService],
    }).compile();

    controller = module.get<PetclaimsController>(PetclaimsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
