import { UserEntity } from '@app/entities';
import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = UserEntity>(
    err: HttpException,
    user: UserEntity,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user as TUser;
  }
}

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest<TUser = UserEntity>(
    err: HttpException,
    user: UserEntity,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user as TUser;
  }
}
