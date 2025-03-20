import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { DocumentEntity } from '../entities';
import {
  DataSource,
  EntityManager,
  EntityTarget,
  Repository,
  UpdateResult,
} from 'typeorm';
import { S3UploadQueue } from 'src/queues';
import { v4 as uuidv4 } from 'uuid';
import { EDocumentStatus } from '@app/enums';

@Injectable()
export class DocumentRepository extends Repository<DocumentEntity> {
  constructor(
    @Optional() _target: EntityTarget<DocumentEntity>,
    entityManager: EntityManager,
    private readonly dataSource: DataSource,
    private readonly s3Queue: S3UploadQueue,
  ) {
    super(DocumentEntity, entityManager);
  }

  async createDocumentAndAddToQueue(input: {
    userId: string;
    files: Express.Multer.File[];
  }): Promise<boolean> {
    const { userId, files } = input;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      files.forEach(async (file) => {
        const key = `uploads/${uuidv4()}-${file.originalname}`;
        const document = queryRunner.manager
          .getRepository(DocumentEntity)
          .create({
            key,
            mimeType: file.mimetype,
            user: { id: userId },
          });
        await queryRunner.manager.save(document);
        await this.s3Queue.addToQueue({ key, documentId: document.id, file });
      });
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateDocumentStatus(input: {
    documentId: string;
    documentStatus: EDocumentStatus;
    objectURL: string | null;
  }): Promise<UpdateResult> {
    const { documentId, documentStatus, objectURL } = input;
    return this.update(
      { id: documentId },
      {
        documentStatus,
        objectURL,
      },
    );
  }

  async deleteExistingDocument(input: {
    documentId: string;
    userId: string;
  }): Promise<UpdateResult> {
    const { userId, documentId } = input;
    return this.softDelete({
      id: documentId,
      user: { id: userId },
    });
  }

  async updateDocumentAndAddToQueue(input: {
    file: Express.Multer.File;
    documentId: string;
  }): Promise<boolean> {
    const { file, documentId } = input;
    const key = `uploads/${uuidv4()}-${file.originalname}`;
    await this.update(
      { id: documentId },
      {
        key,
        mimeType: file.mimetype,
        documentStatus: EDocumentStatus.PROCESSING,
      },
    );
    await this.s3Queue.addToQueue({ key, documentId, file });
    return true;
  }

  async getDocument(input: {
    documentId: string;
    userId: string;
  }): Promise<DocumentEntity> {
    const { documentId, userId } = input;
    const document = await this.findOneBy({
      id: documentId,
      user: { id: userId },
    });
    if (!document) throw new NotFoundException('No existing document found');
    return document;
  }

  async getAllDocuments(input: {
    userId?: string;
    documentStatus?: EDocumentStatus;
    skip: number;
    limit: number;
  }): Promise<DocumentEntity[]> {
    const { userId, skip, limit, documentStatus } = input;
    return this.find({
      where: {
        ...(userId ? { user: { id: userId } } : {}),
        ...(documentStatus ? { documentStatus } : {}),
      },
      relations: {
        user: true,
      },
      skip,
      take: limit,
    });
  }

  async getOneDocument(input: { documentId: string }): Promise<DocumentEntity> {
    const { documentId } = input;
    const document = await this.findOne({
      where: { id: documentId },
      relations: { user: true },
    });
    if (!document) throw new NotFoundException('No existing document found');
    return document;
  }
}
