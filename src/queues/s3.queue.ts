import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { S3UploadJobData } from '@app/types';

@Injectable()
export class S3UploadQueue {
  private queue: Queue;

  constructor(private readonly configService: ConfigService) {
    this.queue = new Queue('s3-upload', {
      connection: {
        host: this.configService.get('REDIS_HOST'),
        port: this.configService.get('REDIS_PORT'),
      },
    });
  }

  async addToQueue(input: S3UploadJobData) {
    const { file, assetId,key } = input;
    this.queue.add('s3-upload', <S3UploadJobData>{ assetId, file,key });
  }
}
