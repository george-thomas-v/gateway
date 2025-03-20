import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { EUserRoles } from '@app/enums';
import { GetAllDocumentsQueryDto } from './dto';
import { DocumentDto, ResponseDto } from 'src/libs/dto';
import { ExecutionContext } from '@nestjs/common';
import { UserEntity } from '@app/entities';
import { Readable } from 'stream';

const mockDocumentService = {
  uploadFiles: jest.fn(),
  updateDocumentFile: jest.fn(),
  deleteDocument: jest.fn(),
  getAllDocuments: jest.fn(),
  getDocument: jest.fn(),
};

const mockUser = { id: 'user-id', role: EUserRoles.EDITOR } as UserEntity;

const mockJwtGuard = {
  canActivate: (context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    req.user = mockUser;
    return true;
  },
};

const mockRolesGuard = {
  canActivate: () => true,
};

describe('DocumentController', () => {
  let controller: DocumentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [{ provide: DocumentService, useValue: mockDocumentService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<DocumentController>(DocumentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFiles', () => {
    it('should upload files', async () => {
      const buffer = Buffer.from('dummy content');
      const mockFile = {
        fieldname: 'files',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: buffer.length,
        buffer,
        stream: Readable.from(buffer),
        destination: '',
        filename: '',
        path: '',
      } as Express.Multer.File;

      const mockResponse: ResponseDto = { success: true, message: 'Uploaded' };
      mockDocumentService.uploadFiles.mockResolvedValue(mockResponse);

      const result = await controller.uploadFiles({ files: [mockFile] }, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateDocumentFile', () => {
    it('should update file for a document', async () => {
      const buffer = Buffer.from('update content');
      const file = {
        fieldname: 'file',
        originalname: 'newfile.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: buffer.length,
        buffer,
        stream: Readable.from(buffer),
        destination: '',
        filename: '',
        path: '',
      } as Express.Multer.File;

      const mockResponse: ResponseDto = { success: true, message: 'Updated' };
      mockDocumentService.updateDocumentFile.mockResolvedValue(mockResponse);

      const result = await controller.updateDocumentFile('document-id', file, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteDocument', () => {
    it('should delete document and return response', async () => {
      const mockResponse: ResponseDto = { success: true, message: 'Deleted' };
      mockDocumentService.deleteDocument.mockResolvedValue(mockResponse);

      const result = await controller.deleteDocument(mockUser, 'document-id');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAllDocuments', () => {
    it('should return list of all documents', async () => {
      const input = { page: 1, limit: 10 } as any; // Use `any` if DTO is strict
      const mockDocuments: DocumentDto[] = [{ id: 'document-1', key: 'key-1' } as DocumentDto];
      mockDocumentService.getAllDocuments.mockResolvedValue(mockDocuments);

      const result = await controller.getAllDocuments(input);
      expect(result).toEqual(mockDocuments);
    });
  });

  describe('getUserDocuments', () => {
    it('should return list of user documents', async () => {
      const input = { page: 1, limit: 10 } as any; // Use `any` if DTO is strict
      const mockDocuments: DocumentDto[] = [{ id: 'document-2', key: 'key-2' } as DocumentDto];
      mockDocumentService.getAllDocuments.mockResolvedValue(mockDocuments);

      const result = await controller.getUserDocuments(input, mockUser);
      expect(result).toEqual(mockDocuments);
    });
  });

  describe('getDocument', () => {
    it('should return a single document by id', async () => {
      const mockDocument: DocumentDto = { id: 'document-id', key: 'key-xyz' } as DocumentDto;
      mockDocumentService.getDocument.mockResolvedValue(mockDocument);

      const result = await controller.getDocument('document-id');
      expect(result).toEqual(mockDocument);
    });
  });
});
