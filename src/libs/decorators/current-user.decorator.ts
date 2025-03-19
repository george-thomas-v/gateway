import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { UserEntity } from '@app/entities';

export const CurrentUser = createParamDecorator(
  (_, ctx: ExecutionContext): UserEntity => {
    const request = ctx.switchToHttp().getRequest();
    const user: UserEntity = request.user;
    if (!user) throw new Error('Guards not added.');
    return user;
  },
);
