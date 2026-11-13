import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { AggregatedSightingsService } from './aggregated-sightings.service.js';
import { UpdateAggregatedSightingDto } from './dto/update-aggregated-sighting.dto.js';
import { SightingsService } from '../sightings/sightings.service.js';
import { GetAggregatedSightingsDto } from './dto/get-aggregated-sightings.dto.js';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@Controller('aggregated-sightings')
export class AggregatedSightingsController {
  constructor(
    private readonly aggregatedSightingsService: AggregatedSightingsService,
    private readonly sightingsService: SightingsService,
  ) {}

  @Get()
  findAll(@Query() query: GetAggregatedSightingsDto) {
    return this.aggregatedSightingsService.findAll(
      query.latitude,
      query.longitude,
      query.radius,
    );
  }

  @Get('my')
  @UseGuards(SupabaseAuthGuard)
  async findByLinkedSightingId(
    @Query('linkedSightingId', ParseUUIDPipe) linkedSightingId: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.aggregatedSightingsService.findByLinkedSightingId(
      linkedSightingId,
      userId,
    );
  }

  @Get(':id/')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.aggregatedSightingsService.findOne(id);
  }

  @Get(':id/details')
  async findOneWithDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('linkedSightingId', ParseUUIDPipe) linkedSightingId: string,
  ) {
    const [summary, sightings] = await Promise.all([
      this.aggregatedSightingsService.findOne(id),
      this.sightingsService.findAll(linkedSightingId),
    ]);

    if (summary.linkedSightingId !== linkedSightingId) {
      throw new BadRequestException('Invalid IDs');
    }

    return {
      summary,
      sightings,
    };
  }

  @Patch('my/:id')
  @UseGuards(SupabaseAuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAggregatedSightingDto: UpdateAggregatedSightingDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.aggregatedSightingsService.update(
      id,
      userId || '',
      updateAggregatedSightingDto,
    );
  }

  @Patch('/status')
  @UseGuards(SupabaseAuthGuard)
  async updateStatus(
    @Query('petId') petId: string,
    @Body('isActive') isActive: boolean,
    @CurrentUser('id') userId: string,
  ) {
    const sightings =
      await this.aggregatedSightingsService.findActivePetSightingsById(
        userId,
        petId,
      );
    if (!sightings || sightings.length === 0) {
      throw new NotFoundException('Sighting not found');
    }
    const ids = sightings.map((s) => s.id);
    const linkedSightingIds = sightings.map((s) => s.linkedSightingId);

    let updated = await this.aggregatedSightingsService.updateStatus(
      ids,
      isActive,
    );

    if (updated) {
      updated = await this.sightingsService.updateStatus(
        linkedSightingIds,
        isActive,
      );
    }

    return updated;
  }

  @Get('/pets/:petId')
  @UseGuards(SupabaseAuthGuard)
  async getPetSightings(
    @Param('petId') petId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.aggregatedSightingsService.findActivePetSightingsById(
      userId,
      petId,
    );
  }
}
