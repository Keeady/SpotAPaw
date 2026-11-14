import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class CronProcessAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.headers['authorization'];
    const secret = process.env.PROCESS_SECRET;

    // Fail closed if the env var is missing
    if (!secret || !header) throw new UnauthorizedException();

    const expected = Buffer.from(`Bearer ${secret}`);
    const received = Buffer.from(header);

    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
