export interface S3UploadJobData {
  file: Express.Multer.File;
  documentId: string;
  key:string;
}
