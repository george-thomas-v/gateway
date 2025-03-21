import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/user/user.module';
import { DocumentModule } from './features/document/document.module';
import { DataModule } from './data/data.module';
import { ConfigModule } from '@nestjs/config';
import { KafkaService, S3UploadService } from './services';
import { S3UploadQueue } from './queues';
import { S3UploadWorker } from './workers';
import { GetEnvVariables } from './utils';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    DocumentModule,
    DataModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    S3UploadService,
    S3UploadQueue,
    S3UploadWorker,
    GetEnvVariables,
    KafkaService,
  ],
})
export class AppModule {}
