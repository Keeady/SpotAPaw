import {
  Controller,
  Get,
  UseGuards,
} from "@nestjs/common";
import { User } from "@supabase/supabase-js";
import { SupabaseAuthGuard } from "../auth/supabase-auth.guard.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import { PetsService } from "./pets.service.js";

@Controller("pets")
@UseGuards(SupabaseAuthGuard)
export class PetsController {
  constructor(
    private readonly petsService: PetsService,
  ) {}

  @Get("my")
  async getMyPets(
    @CurrentUser("id") userId: string
  ) {
    return this.petsService.findByOwner(userId);
  }
}
