import {
  createParamDecorator,
  ExecutionContext,
} from "@nestjs/common";

import { AuthenticatedRequest } from "./types/authenticated-request.type.js";

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