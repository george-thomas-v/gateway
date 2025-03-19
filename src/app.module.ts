import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/user/user.module';
import { DocumentModule } from './features/document/document.module';
import { IngestionModule } from './features/ingestion/ingestion.module';
import { DataModule } from './data/data.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    DocumentModule,
    IngestionModule,
    DataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
