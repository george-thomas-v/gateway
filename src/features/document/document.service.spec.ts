import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { AssetRepository } from 'src/data/repositories';
import { NotFoundException } from '@nestjs/common';
import { EAssetStatus } from '@app/enums';

describe('DocumentService', () => {
  let service: DocumentService;
  let assetRepository: jest.Mocked<AssetRepository>;

  beforeEach(async () => {
    const mockAssetRepository = {
      createAssetAndAddToQueue: jest.fn(),
      updateAssetAndAddToQueue: jest.fn(),
      getAsset: jest.fn(),
      deleteExistingAsset: jest.fn(),
      getAllAssets: jest.fn(),
      getOneAsset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: AssetRepository,
          useValue: mockAssetRepository,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    assetRepository = module.get(AssetRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFiles', () => {
    it('should upload files and return response', async () => {
      assetRepository.createAssetAndAddToQueue.mockResolvedValue(true);

      const result = await service.uploadFiles({
        files: [{ originalname: 'file1.txt' }] as Express.Multer.File[],
        userId: 'user-123',
      });

      expect(result).toEqual({
        success: true,
        message: 'Files uplaod processing',
      });

      expect(assetRepository.createAssetAndAddToQueue).toHaveBeenCalledWith({
        files: [{ originalname: 'file1.txt' }],
        userId: 'user-123',
      });
    });
  });

  describe('updateAssetFile', () => {
    it('should update asset file and return response', async () => {
      assetRepository.getAsset.mockResolvedValue({ id: 'asset-123' } as any);
      assetRepository.updateAssetAndAddToQueue.mockResolvedValue(true);

      const result = await service.updateAssetFile({
        file: { originalname: 'newfile.txt' } as Express.Multer.File,
        assetId: 'asset-123',
        userId: 'user-123',
      });

      expect(assetRepository.getAsset).toHaveBeenCalledWith({
        assetId: 'asset-123',
        userId: 'user-123',
      });

      expect(assetRepository.updateAssetAndAddToQueue).toHaveBeenCalledWith({
        file: { originalname: 'newfile.txt' },
        assetId: 'asset-123',
      });

      expect(result).toEqual({
        success: true,
        message: 'File upload in progress',
      });
    });
  });

  describe('deleteAsset', () => {
    it('should delete asset and return success response', async () => {
      assetRepository.deleteExistingAsset.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });
      

      const result = await service.deleteAsset({
        assetId: 'asset-123',
        userId: 'user-123',
      });

      expect(assetRepository.deleteExistingAsset).toHaveBeenCalledWith({
        assetId: 'asset-123',
        userId: 'user-123',
      });

      expect(result).toEqual({
        success: true,
        message: 'File deleted successfully',
      });
    });

    it('should throw NotFoundException if no file deleted', async () => {
      assetRepository.deleteExistingAsset.mockResolvedValue({
        affected: 0,
        raw: [],
        generatedMaps: [],
      });
      

      await expect(
        service.deleteAsset({
          assetId: 'asset-404',
          userId: 'user-123',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllAssets', () => {
    it('should return all assets', async () => {
      const mockAssets = [{ id: 'asset-1' }, { id: 'asset-2' }];
      assetRepository.getAllAssets.mockResolvedValue(mockAssets as any);

      const result = await service.getAllAssets({
        userId: 'user-123',
        assetStatus: EAssetStatus.PROCESSING,
        skip: 0,
        limit: 10,
      });

      expect(assetRepository.getAllAssets).toHaveBeenCalledWith({
        userId: 'user-123',
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(mockAssets);
    });
  });

  describe('getAsset', () => {
    it('should return one asset', async () => {
      const mockAsset = { id: 'asset-1' };
      assetRepository.getOneAsset.mockResolvedValue(mockAsset as any);

      const result = await service.getAsset({ assetId: 'asset-1' });

      expect(assetRepository.getOneAsset).toHaveBeenCalledWith({
        assetId: 'asset-1',
      });

      expect(result).toEqual(mockAsset);
    });
  });
});
