import {
  createParamDecorator,
  ExecutionContext,
} from "@nestjs/common";

import { AuthUser } from "./auth-user.type.js";

type AuthenticatedRequest = Request & {
  user: AuthUser;
};

export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthenticatedRequest["user"] | undefined,
    ctx: ExecutionContext,
  ) => {
    const request = ctx
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    return data ? request.user[data] : request.user;
  },
);