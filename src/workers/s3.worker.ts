import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { S3UploadService } from 'src/services/s3.service';
import { S3UploadJobData } from '@app/types';
import { GetEnvVariables } from '@app/utils';
import { AssetRepository } from 'src/data/repositories';
import { EAssetStatus } from '@app/enums';

@Injectable()
export class S3UploadWorker implements OnModuleInit, OnModuleDestroy {
  private worker: Worker;

  constructor(
    private readonly s3UploadService: S3UploadService,
    private readonly getEnvVariables: GetEnvVariables,
    private readonly assetRepository: AssetRepository,
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      's3-upload',
      async (job: Job<S3UploadJobData>) => {
        const { file, assetId, key } = job.data;
        try {
          const response = await this.s3UploadService.uploadFile({ file, key });
          if (response.url)
            await this.assetRepository.updateAssetStatus({
              assetId,
              assetStatus: EAssetStatus.COMPLETED,
              objectURL: response.url,
            });
        } catch (e) {
          console.log(e)
          await this.assetRepository.updateAssetStatus({
            assetId,
            assetStatus: EAssetStatus.FAILED,
            objectURL: null,
          });
        }
      },
      {
        connection: {
          host: this.getEnvVariables.redisHost,
          port: parseInt(this.getEnvVariables.redisPort),
        },
      },
    );

    this.worker.on('completed', (job) => {
      console.log(`✅ Job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`❌ Job ${job?.id} failed:`, err.message);
    });
  }

  onModuleDestroy() {
    this.worker?.close();
  }
}
