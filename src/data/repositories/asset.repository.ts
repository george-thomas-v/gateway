import { Injectable, Optional } from '@nestjs/common';
import { AssetEntity } from '../entities';
import {
  DataSource,
  EntityManager,
  EntityTarget,
  Repository,
  UpdateResult,
} from 'typeorm';

@Injectable()
export class AssetRepository extends Repository<AssetEntity> {
  constructor(
    @Optional() _target: EntityTarget<AssetEntity>,
    entityManager: EntityManager,
    private readonly dataSource: DataSource,
  ) {
    super(AssetEntity, entityManager);
  }


}
