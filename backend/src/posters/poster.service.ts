import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Poster } from './entities/poster.entity.js';
import { UpdatePosterDto } from './dto/update-poster.dto.js';

@Injectable()
export class PosterService {
  constructor(
    @InjectRepository(Poster)
    private readonly posterRepository: Repository<Poster>,
  ) {}

  async getPoster(
    posterId?: number,
    sightingId?: string,
  ): Promise<Poster> {
    const hasPosterId = posterId !== undefined;
    const hasSightingId = sightingId !== undefined;

    if (!hasPosterId && !hasSightingId) {
      throw new BadRequestException(
        'Provide either of posterId or sightingId.',
      );
    }

    const poster = hasPosterId
      ? await this.posterRepository.findOneBy({ id: posterId! })
      : await this.posterRepository.findOneBy({
          sightingId: sightingId!,
        });

    if (!poster) {
      throw new NotFoundException('Poster not found.');
    }

    return poster;
  }

  async updatePoster(
    posterId: number,
    dto: UpdatePosterDto,
  ): Promise<Poster> {
    const changes: Partial<
      Pick<Poster, 'description' | 'cta' | 'contactName' | 'contactPhone'>
    > = {};

    if (dto.description !== undefined) {
      changes.description = dto.description;
    }

    if (dto.cta !== undefined) {
      changes.cta = dto.cta;
    }

    if (dto.contactName !== undefined) {
      changes.contactName = dto.contactName;
    }

    if (dto.contactPhone !== undefined) {
      changes.contactPhone = dto.contactPhone;
    }

    if (Object.keys(changes).length === 0) {
      throw new BadRequestException(
        'Provide at least one editable field.',
      );
    }

    const result = await this.posterRepository.update(
      { id: posterId },
      changes,
    );

    if (result.affected === 0) {
      throw new NotFoundException('Poster not found.');
    }

    return this.getPoster(posterId);
  }
}
