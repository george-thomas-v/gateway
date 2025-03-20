import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { GetEnvVariables } from '@app/utils';

@Injectable()
export class S3UploadService {
  private s3: S3Client;
  private bucketName: string;
  private s3Region: string;

  constructor(private readonly getEnvVariables: GetEnvVariables) {
    this.s3 = new S3Client({
      region: this.getEnvVariables.s3Region,
      credentials: {
        accessKeyId: this.getEnvVariables.s3AccessKeyId,
        secretAccessKey: this.getEnvVariables.s3AccessSecret,
      },
      runtime: 'node',
    });

    this.bucketName = this.getEnvVariables.bucketName;
    this.s3Region = this.getEnvVariables.s3Region;
  }

  async uploadFile(input: { file: Express.Multer.File; key: string }) {
    const { key, file } = input;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: Buffer.from(file.buffer),
      ContentType: file.mimetype,
    });

    await this.s3.send(command);

    return {
      key,
      url: `https://${this.bucketName}.s3.${this.s3Region}.amazonaws.com/${key}`,
      mimeType: file.mimetype,
    };
  }
}
