import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getProfile(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { ownerId: userId },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const changes: Partial<User> = {};

    if (dto.countryCode !== undefined) {
      changes.countryCode = dto.countryCode;
    }

    if (dto.email !== undefined) {
      changes.email = dto.email;
    }

    if (dto.firstname !== undefined) {
      changes.firstname = dto.firstname;
    }

    if (dto.lastname !== undefined) {
      changes.lastname = dto.lastname;
    }

    if (dto.phone !== undefined) {
      changes.phone = dto.phone;
    }

    if (Object.keys(changes).length === 0) {
      throw new BadRequestException('Provide at least one field to update.');
    }

    const existingUser = await this.userRepository.findOne({
      where: {
        ownerId: userId,
      },
    });

    let response;
    if (existingUser) {
      response = await this.userRepository.update({ ownerId: userId }, changes);
      if (response.affected === 0) {
        throw new NotFoundException('Profile not found.');
      }
    } else {
      response = await this.userRepository.insert({
        ownerId: userId,
        ...changes,
      });
      if (response.identifiers.length === 0) {
        throw new InternalServerErrorException();
      }
    }

    return this.userRepository.findOneOrFail({
      where: { ownerId: userId },
    });
  }

  async deleteProfile(userId: string): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: {
        ownerId: userId,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('Profile not found.');
    }

    const response = await this.userRepository.update(
      { ownerId: userId },
      { markedForDeletion: true },
    );
    if (response.affected === 0) {
      throw new NotFoundException('Profile not found.');
    }
  }
}
