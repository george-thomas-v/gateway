import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { EUserRoles } from '@app/enums';
import { GetAllAssetsQueryDto } from './dto';
import { AssetDto, ResponseDto } from 'src/libs/dto';
import { ExecutionContext } from '@nestjs/common';
import { UserEntity } from '@app/entities';
import { Readable } from 'stream';

const mockDocumentService = {
  uploadFiles: jest.fn(),
  updateAssetFile: jest.fn(),
  deleteAsset: jest.fn(),
  getAllAssets: jest.fn(),
  getAsset: jest.fn(),
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

  describe('updateAssetFile', () => {
    it('should update file for an asset', async () => {
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
      mockDocumentService.updateAssetFile.mockResolvedValue(mockResponse);

      const result = await controller.updateAssetFile('asset-id', file, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteAsset', () => {
    it('should delete asset and return response', async () => {
      const mockResponse: ResponseDto = { success: true, message: 'Deleted' };
      mockDocumentService.deleteAsset.mockResolvedValue(mockResponse);

      const result = await controller.deleteAsset(mockUser, 'asset-id');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAllAssets', () => {
    it('should return list of all assets', async () => {
      const input = { page: 1, limit: 10 } as any; // Use `any` if DTO is strict
      const mockAssets: AssetDto[] = [{ id: 'asset-1', key: 'key-1' } as AssetDto];
      mockDocumentService.getAllAssets.mockResolvedValue(mockAssets);

      const result = await controller.getAllAssets(input);
      expect(result).toEqual(mockAssets);
    });
  });

  describe('getUserAssets', () => {
    it('should return list of user assets', async () => {
      const input = { page: 1, limit: 10 } as any; // Use `any` if DTO is strict
      const mockAssets: AssetDto[] = [{ id: 'asset-2', key: 'key-2' } as AssetDto];
      mockDocumentService.getAllAssets.mockResolvedValue(mockAssets);

      const result = await controller.getUserAssets(input, mockUser);
      expect(result).toEqual(mockAssets);
    });
  });

  describe('getAsset', () => {
    it('should return a single asset by id', async () => {
      const mockAsset: AssetDto = { id: 'asset-id', key: 'key-xyz' } as AssetDto;
      mockDocumentService.getAsset.mockResolvedValue(mockAsset);

      const result = await controller.getAsset('asset-id');
      expect(result).toEqual(mockAsset);
    });
  });
});
