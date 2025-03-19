import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GetEnvVariables {
  constructor(private readonly configService: ConfigService) {}
  get jwtSecret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET');
  }

  get jwtRefreshSecret(): string {
    return this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
  }
}
