import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { PosterService } from './poster.service.js';
import { GetPosterQueryDto } from './dto/get-poster-query.dto.js';
import { UpdatePosterDto } from './dto/update-poster.dto.js';
import { PosterParamsDto } from './dto/poster-params.dto.js';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@Controller('posters')
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class PosterController {
  constructor(private readonly posterService: PosterService) {}

  @Get()
  async getPoster(@Query() query: GetPosterQueryDto) {
    const hasPosterId = query.posterId !== undefined;
    const hasSightingId = query.sightingId !== undefined;

    if (!hasPosterId && !hasSightingId) {
      throw new BadRequestException(
        'Provide either posterId or sightingId.',
      );
    }

    return this.posterService.getPoster(
      query.posterId,
      query.sightingId,
    );
  }

  @Patch(':posterId')
  @UseGuards(SupabaseAuthGuard)
  async updatePoster(
    @CurrentUser('id') userId: string,
    @Param() params: PosterParamsDto,
    @Body() body: UpdatePosterDto,
  ) {
    if (Object.keys(body).length === 0) {
      throw new BadRequestException(
        'Provide at least one editable field.',
      );
    }

    const poster = await this.posterService.updatePoster(
      userId,
      params.posterId,
      body,
    );

    if (!poster) {
      throw new NotFoundException('Poster not found.');
    }

    return poster;
  }
}
