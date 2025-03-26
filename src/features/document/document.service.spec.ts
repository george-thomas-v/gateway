import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { DocumentRepository } from 'src/data/repositories';
import { NotFoundException } from '@nestjs/common';
import { EDocumentStatus } from '@app/enums';
import { DocumentEntity } from '@app/entities';
import { KafkaService } from 'src/services';

describe('DocumentService', () => {
  let service: DocumentService;
  let documentRepository: jest.Mocked<DocumentRepository>;
  let kafkaService: jest.Mocked<KafkaService>;

  beforeEach(async () => {
    const mockDocumentRepository = {
      createDocument: jest.fn(),
      updateDocumentAndAddToQueue: jest.fn(),
      getDocument: jest.fn(),
      deleteExistingDocument: jest.fn(),
      getAllDocuments: jest.fn(),
      getOneDocument: jest.fn(),
    };
    const mockKafkaService = {
      sendMessage: jest.fn().mockResolvedValue(undefined), // Mock sendMessage method
      startProcessing: jest.fn().mockResolvedValue(undefined), // Mock startProcessing method
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: DocumentRepository,
          useValue: mockDocumentRepository,
        },
        {
          provide: KafkaService,
          useValue: mockKafkaService,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    documentRepository = module.get(DocumentRepository);
    kafkaService = module.get(KafkaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFiles', () => {
    it('should upload files and return response', async () => {
      documentRepository.createDocument.mockResolvedValue(<DocumentEntity[]>[
        {id:"docId-1",documentStatus:EDocumentStatus.PROCESSING,},
      ]);

      const result = await service.uploadFiles({
        files: [{ originalname: 'file1.txt' }] as Express.Multer.File[],
        userId: 'user-123',
      });

      expect(result).toEqual({
        success: true,
        message: 'Files upload processing',
      });

      expect(documentRepository.createDocument).toHaveBeenCalledWith({
        files: [{ originalname: 'file1.txt' }],
        userId: 'user-123',
      });
    });
  });

  describe('updateDocumentFile', () => {
    it('should update document file and return response', async () => {
      documentRepository.getDocument.mockResolvedValue({
        id: 'document-123',
      } as any);
      documentRepository.updateDocumentAndAddToQueue.mockResolvedValue(true);

      const result = await service.updateDocumentFile({
        file: { originalname: 'newfile.txt' } as Express.Multer.File,
        documentId: 'document-123',
        userId: 'user-123',
      });

      expect(documentRepository.getDocument).toHaveBeenCalledWith({
        documentId: 'document-123',
        userId: 'user-123',
      });

      expect(
        documentRepository.updateDocumentAndAddToQueue,
      ).toHaveBeenCalledWith({
        file: { originalname: 'newfile.txt' },
        documentId: 'document-123',
      });

      expect(result).toEqual({
        success: true,
        message: 'File upload in progress',
      });
    });
  });

  describe('deleteDocument', () => {
    it('should delete document and return success response', async () => {
      documentRepository.deleteExistingDocument.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });

      const result = await service.deleteDocument({
        documentId: 'document-123',
        userId: 'user-123',
      });

      expect(documentRepository.deleteExistingDocument).toHaveBeenCalledWith({
        documentId: 'document-123',
        userId: 'user-123',
      });

      expect(result).toEqual({
        success: true,
        message: 'File deleted successfully',
      });
    });

    it('should throw NotFoundException if no file deleted', async () => {
      documentRepository.deleteExistingDocument.mockResolvedValue({
        affected: 0,
        raw: [],
        generatedMaps: [],
      });

      await expect(
        service.deleteDocument({
          documentId: 'document-404',
          userId: 'user-123',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllDocuments', () => {
    it('should return all documents', async () => {
      const mockDocuments = [{ id: 'document-1' }, { id: 'document-2' }];
      documentRepository.getAllDocuments.mockResolvedValue(
        mockDocuments as any,
      );

      const result = await service.getAllDocuments({
        userId: 'user-123',
        documentStatus: EDocumentStatus.PROCESSING,
        skip: 0,
        limit: 10,
      });

      expect(documentRepository.getAllDocuments).toHaveBeenCalledWith({
        userId: 'user-123',
        skip: 0,
        limit: 10,
        documentStatus:EDocumentStatus.PROCESSING
      });

      expect(result).toEqual(mockDocuments);
    });
  });

  describe('getDocument', () => {
    it('should return one document', async () => {
      const mockDocument = { id: 'document-1' };
      documentRepository.getOneDocument.mockResolvedValue(mockDocument as any);

      const result = await service.getDocument({ documentId: 'document-1' });

      expect(documentRepository.getOneDocument).toHaveBeenCalledWith({
        documentId: 'document-1',
      });

      expect(result).toEqual(mockDocument);
    });
  });
});
