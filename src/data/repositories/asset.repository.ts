import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { AssetEntity } from '../entities';
import {
  DataSource,
  EntityManager,
  EntityTarget,
  Repository,
  UpdateResult,
} from 'typeorm';
import { S3UploadQueue } from 'src/queues';
import { v4 as uuidv4 } from 'uuid';
import { EAssetStatus } from '@app/enums';
@Injectable()
export class AssetRepository extends Repository<AssetEntity> {
  constructor(
    @Optional() _target: EntityTarget<AssetEntity>,
    entityManager: EntityManager,
    private readonly dataSource: DataSource,
    private readonly s3Queue: S3UploadQueue,
  ) {
    super(AssetEntity, entityManager);
  }

  async createAssetAndAddToQueue(input: {
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
        const asset = queryRunner.manager.getRepository(AssetEntity).create({
          key,
          mimeType: file.mimetype,
          user: { id: userId },
        });
        await queryRunner.manager.save(asset);
        await this.s3Queue.addToQueue({ key, assetId: asset.id, file });
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

  async updateAssetStatus(input: {
    assetId: string;
    assetStatus: EAssetStatus;
    objectURL: string | null;
  }): Promise<UpdateResult> {
    const { assetId, assetStatus, objectURL } = input;
    return this.update(
      { id: assetId },
      {
        assetStatus,
        objectURL,
      },
    );
  }

  async deleteExistingAsset(input: {
    assetId: string;
    userId: string;
  }): Promise<UpdateResult> {
    const { userId, assetId } = input;
    return this.softDelete({
      id: assetId,
      user: { id: userId },
    });
  }

  async updateAssetAndAddToQueue(input: {
    file: Express.Multer.File;
    assetId: string;
  }): Promise<boolean> {
    const { file, assetId } = input;
    const key = `uploads/${uuidv4()}-${file.originalname}`;
    await this.update(
      { id: assetId },
      {
        key,
        mimeType: file.mimetype,
        assetStatus: EAssetStatus.PROCESSING,
      },
    );
    await this.s3Queue.addToQueue({ key, assetId: assetId, file });
    return true;
  }

  async getAsset(input: {
    assetId: string;
    userId: string;
  }): Promise<AssetEntity> {
    const { assetId, userId } = input;
    const asset = await this.findOneBy({ id: assetId, user: { id: userId } });
    if (!asset) throw new NotFoundException('N existing asset found');
    return asset;
  }

  async getAllAssets(input: {
    userId?: string;
    assetStatus?: EAssetStatus;
    skip: number;
    limit: number;
  }): Promise<AssetEntity[]> {
    const { userId, skip, limit, assetStatus } = input;
    console.log(input,";;;;")
    return this.find({
      where: {
        ...(userId ? { user: { id: userId } } : {}),
        ...(assetStatus ? { assetStatus } : {}),
      },
      relations: {
        user: true,
      },
      skip,
      take: limit,
    });
  }

  async getOneAsset(input: { assetId: string }): Promise<AssetEntity> {
    const { assetId } = input;
    const asset = await this.findOne({
      where: { id: assetId },
      relations: { user: true },
    });
    if (!asset) throw new NotFoundException('N existing asset found');
    return asset;
  }

  
}
