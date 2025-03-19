export interface S3UploadJobData {
  file: Express.Multer.File;
  assetId: string;
  key:string;
}
