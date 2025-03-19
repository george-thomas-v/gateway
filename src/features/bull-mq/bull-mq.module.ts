import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { bullConfig } from 'src/config';

@Module({
  imports: [BullModule.forRoot(bullConfig)],
})
export class BullQueueModule {}
