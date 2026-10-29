import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service.js';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth-user.type.js';

@Controller('profile')
@UseGuards(SupabaseAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Get()
  async getProfile(
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.profileService.getProfile(user.id);
    if (!data) {
      return {
        ownerId: user.id,
        email: "",
        firstname: "",
        lastname: "",
        countryCode: "",
        phone: "",
      };
    }

    return data;
  }
}
