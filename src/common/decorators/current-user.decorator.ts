import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { TActiveUser } from '@/auth/types/active-user';

export const CurrentUser = createParamDecorator(
  (data: keyof TActiveUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as TActiveUser;

    return data ? user?.[data] : user;
  },
);
