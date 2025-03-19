import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IngestionService } from './ingestion.service';
import { CreateIngestionDto } from './dto/create-ingestion.dto';
import { UpdateIngestionDto } from './dto/update-ingestion.dto';

@Controller()
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @MessagePattern('createIngestion')
  create(@Payload() createIngestionDto: CreateIngestionDto) {
    return this.ingestionService.create(createIngestionDto);
  }

  @MessagePattern('findAllIngestion')
  findAll() {
    return this.ingestionService.findAll();
  }

  @MessagePattern('findOneIngestion')
  findOne(@Payload() id: number) {
    return this.ingestionService.findOne(id);
  }

  @MessagePattern('updateIngestion')
  update(@Payload() updateIngestionDto: UpdateIngestionDto) {
    return this.ingestionService.update(updateIngestionDto.id, updateIngestionDto);
  }

  @MessagePattern('removeIngestion')
  remove(@Payload() id: number) {
    return this.ingestionService.remove(id);
  }
}
