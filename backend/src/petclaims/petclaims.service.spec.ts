import { Test, TestingModule } from '@nestjs/testing';
import { PetclaimsService } from './petclaims.service.js';

describe('PetclaimsService', () => {
  let service: PetclaimsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PetclaimsService],
    }).compile();

    service = module.get<PetclaimsService>(PetclaimsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
