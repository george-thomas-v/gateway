import { Injectable, NotFoundException } from '@nestjs/common';
import { AssetRepository } from 'src/data/repositories';
import { AssetDto, ResponseDto } from 'src/libs/dto';
import { GetAllAssetsQueryDto } from './dto';

@Injectable()
export class DocumentService {
  constructor(private readonly assetRepository: AssetRepository) {}

  async uploadFiles(input: {
    files: Express.Multer.File[];
    userId: string;
  }): Promise<ResponseDto> {
    const { userId, files } = input;
    return {
      success: await this.assetRepository.createAssetAndAddToQueue({
        userId,
        files,
      }),
      message: 'Files uplaod processing',
    };
  }

  async updateAssetFile(input: {
    file: Express.Multer.File;
    userId: string;
    assetId: string;
  }): Promise<ResponseDto> {
    const { file, assetId, userId } = input;
    await this.assetRepository.getAsset({ assetId, userId });
    return {
      success: await this.assetRepository.updateAssetAndAddToQueue({
        file,
        assetId,
      }),
      message: 'File upload in progress',
    };
  }

  async deleteAsset(input: {
    assetId: string;
    userId: string;
  }): Promise<ResponseDto> {
    const { assetId, userId } = input;
    const result = await this.assetRepository.deleteExistingAsset({
      assetId,
      userId,
    });
    const { affected } = result;
    if (affected === 0) throw new NotFoundException('No file found to delete');
    return {
      success: true,
      message: 'File deleted successfully',
    };
  }

  async getAllAssets(input: GetAllAssetsQueryDto): Promise<AssetDto[]> {
    return this.assetRepository.getAllAssets({ ...input });
  }

  async getAsset(input:{assetId:string}):Promise<AssetDto> {
    const {assetId} = input;
    return this.assetRepository.getOneAsset({assetId})
  }
}
