import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Pet } from "./entities/pet.entity.js";

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
  ) {}

  async findByOwner(userId: string) {
    return this.petRepository.find({
      where: {
        ownerId: userId,
      },
    });
  }
}
