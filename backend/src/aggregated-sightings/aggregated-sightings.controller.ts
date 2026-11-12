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

  @Get(':id/')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.aggregatedSightingsService.findOne(id);
  }

  @Get(':id/details')
  async findOneWithDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('linked_sighting_id', ParseUUIDPipe) linked_sighting_id: string,
  ) {
    const [summary, sightings] = await Promise.all([
      this.aggregatedSightingsService.findOne(id),
      this.sightingsService.findAll(linked_sighting_id),
    ]);

    if (summary.linkedSightingId !== linked_sighting_id) {
      throw new BadRequestException('Invalid IDs');
    }

    return {
      summary,
      sightings,
    };
  }

  @Get('my/:linkedSightingId')
  async findByLinkedSightingId(
    @Param('linkedSightingId', ParseUUIDPipe) linkedSightingId: string,
  ) {
    return this.sightingsService.findAll(linkedSightingId);
  }

  @Patch('my/:id')
  update(
    @Param('id') id: string,
    @Body() updateAggregatedSightingDto: UpdateAggregatedSightingDto,
    @CurrentUser('id') userId?: string
  ) {
    return this.aggregatedSightingsService.update(
      +id,
      userId || "",
      updateAggregatedSightingDto,
    );
  }

  @Patch('/status')
  @UseGuards(SupabaseAuthGuard)
  async updateStatus(
    @Query('petId') petId: string,
    @Body('status') status: boolean,
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

    const updated = await this.aggregatedSightingsService.updateStatus(
      ids,
      status,
    );

    if (updated) {
      await this.sightingsService.updateStatus(linkedSightingIds, status);
    }
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
