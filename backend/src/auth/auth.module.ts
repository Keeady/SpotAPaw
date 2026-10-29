import { Module } from "@nestjs/common";
import { SupabaseAuthService } from "./supabase-auth.service.js";
import { SupabaseAuthGuard } from "./supabase-auth.guard.js";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [ConfigModule],
  providers: [SupabaseAuthService, SupabaseAuthGuard],
  exports: [SupabaseAuthService, SupabaseAuthGuard],
})
export class AuthModule {}
