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

  get bucketName():string {
    return this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME');
  }

  get s3AccessSecret():string {
    return this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY');
  }

  get s3AccessKeyId():string {
    return this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID');
  }
  get s3Region():string {
    return this.configService.getOrThrow<string>('AWS_REGION');
  }

  get redisHost():string {
    return this.configService.getOrThrow<string>('REDIS_HOST')
  }

  get redisPort():string {
    return this.configService.getOrThrow<string>('REDIS_PORT')
  }
}
