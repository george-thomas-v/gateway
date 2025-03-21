import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { KafkaService } from 'src/services';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService,KafkaService],
})
export class DocumentModule {}
