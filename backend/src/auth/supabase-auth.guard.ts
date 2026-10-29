import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { AuthenticatedRequest } from "./types/authenticated-request.type.js";
import { SupabaseAuthService } from "./supabase-auth.service.js";

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly authService: SupabaseAuthService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;

    const [type, token] = authorization?.split(" ") ?? [];

    if (type !== "Bearer" || !token) {
      throw new UnauthorizedException("Missing access token");
    }

    const user = await this.authService.verifyToken(token);

    request.user = user;

    return true;
  }
}