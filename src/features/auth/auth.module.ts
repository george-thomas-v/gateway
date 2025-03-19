import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard, LocalAuthGuard } from './guards';
import { JwtStrategy, LocalStrategy } from './strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Argon2Utils, GetEnvVariables } from '@app/utils';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
        signOptions: {
          issuer: config.get('JWT_ISSUER'),
          noTimestamp: false,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalAuthGuard,
    LocalStrategy,
    JwtAuthGuard,
    JwtStrategy,
    Argon2Utils,
    JwtService,
    GetEnvVariables,
  ],
})
export class AuthModule {}
