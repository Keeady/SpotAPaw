import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service.js';
import { CronProcessAuthGuard } from '../auth/cron-auth.guard.js';

@Controller('jobs')
// @UseGuards(CronProcessAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('process')
  async process() {
    await this.jobsService.findAll();
  }
}
