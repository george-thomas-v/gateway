import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ConfigService } from '@nestjs/config';
import * as repositories from './repositories';
import * as migrations from './migrations';
import * as entities from './entities';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.getOrThrow('DATABASE_HOST'),
          port: configService.getOrThrow<number>('DATABASE_PORT'),
          username: configService.getOrThrow('DATABASE_USERNAME'),
          password: configService.getOrThrow('DATABASE_PASSWORD'),
          database: configService.getOrThrow('DATABASE_DATABASE'),
          entities,
          migrations,
          migrationsRun: !!configService.get('RUN_DB_MIGRATIONS_ON_START'),
          migrationsTableName: 'migrations',
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: false,
          uuidExtension: 'pgcrypto',
        };
      },
    }),
  ],
  providers: Object.values(repositories),
  exports: Object.values(repositories),
})
export class DataModule {}
