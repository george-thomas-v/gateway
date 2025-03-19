import { Injectable } from '@nestjs/common';
import { CreateIngestionDto } from './dto/create-ingestion.dto';
import { UpdateIngestionDto } from './dto/update-ingestion.dto';

@Injectable()
export class IngestionService {
  create(createIngestionDto: CreateIngestionDto) {
    return 'This action adds a new ingestion';
  }

  findAll() {
    return `This action returns all ingestion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ingestion`;
  }

  update(id: number, updateIngestionDto: UpdateIngestionDto) {
    return `This action updates a #${id} ingestion`;
  }

  remove(id: number) {
    return `This action removes a #${id} ingestion`;
  }
}
