import { Injectable, Optional } from '@nestjs/common';
import { PasswordEntity } from '../entities';
import { DataSource, EntityManager, EntityTarget, Repository } from 'typeorm';

@Injectable()
export class PasswordRepository extends Repository<PasswordEntity> {
  constructor(
    @Optional() _target: EntityTarget<PasswordEntity>,
    entityManager: EntityManager,
    private readonly dataSource: DataSource,
  ) {
    super(PasswordEntity, entityManager);
  }
}
