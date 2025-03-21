import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentRepository } from 'src/data/repositories';
import { DocumentDto, ResponseDto } from 'src/libs/dto';
import { GetAllDocumentsQueryDto } from './dto';
import { S3UploadQueue } from 'src/queues';

@Injectable()
export class DocumentService {
  constructor(
    private readonly documentRepository: DocumentRepository,
  ) {}

  async uploadFiles(input: {
    files: Express.Multer.File[];
    userId: string;
  }): Promise<ResponseDto> {
    const { userId, files } = input;
    return {
      success: await this.documentRepository.createDocument({
        userId,
        files,
      }),
      message: 'Files upload processing',
    };
  }

  async updateDocumentFile(input: {
    file: Express.Multer.File;
    userId: string;
    documentId: string;
  }): Promise<ResponseDto> {
    const { file, documentId, userId } = input;
    await this.documentRepository.getDocument({ documentId, userId });
    return {
      success: await this.documentRepository.updateDocumentAndAddToQueue({
        file,
        documentId,
      }),
      message: 'File upload in progress',
    };
  }

  async deleteDocument(input: {
    documentId: string;
    userId: string;
  }): Promise<ResponseDto> {
    const { documentId, userId } = input;
    const result = await this.documentRepository.deleteExistingDocument({
      documentId,
      userId,
    });
    const { affected } = result;
    if (affected === 0) throw new NotFoundException('No file found to delete');
    return {
      success: true,
      message: 'File deleted successfully',
    };
  }

  async getAllDocuments(
    input: GetAllDocumentsQueryDto,
  ): Promise<DocumentDto[]> {
    return this.documentRepository.getAllDocuments({ ...input });
  }

  async getDocument(input: { documentId: string }): Promise<DocumentDto> {
    const { documentId } = input;
    return this.documentRepository.getOneDocument({ documentId });
  }
}
