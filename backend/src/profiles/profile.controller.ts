import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service.js';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth-user.type.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Controller('profile')
@UseGuards(SupabaseAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@CurrentUser() user: AuthUser) {
    const data = await this.profileService.getProfile(user.id);
    if (!data) {
      return {
        ownerId: user.id,
        email: '',
        firstname: '',
        lastname: '',
        countryCode: '',
        phone: '',
      };
    }

    return data;
  }

  @Patch()
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateProfileDto,
  ) {
    if (Object.keys(body).length === 0) {
      throw new BadRequestException('Provide at least one editable field.');
    }

    return this.profileService.updateProfile(user.id, body);
  }

  @Delete()
  async deleteProfile(@CurrentUser() user: AuthUser) {
    return this.profileService.deleteProfile(user.id);
  }
}
