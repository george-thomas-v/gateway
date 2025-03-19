import { Injectable, Optional } from '@nestjs/common';
import { SessionEntity } from '../entities';
import {
  DataSource,
  EntityManager,
  EntityTarget,
  Repository,
  UpdateResult,
} from 'typeorm';

@Injectable()
export class SessionRepository extends Repository<SessionEntity> {
  constructor(
    @Optional() _target: EntityTarget<SessionEntity>,
    entityManager: EntityManager,
    private readonly dataSource: DataSource,
  ) {
    super(SessionEntity, entityManager);
  }

  async getSessions(input: { userId: string }): Promise<SessionEntity[]> {
    const { userId } = input;
    return this.findBy({ user: { id: userId } });
  }

  async removeSession(input: { sessionId: string }): Promise<UpdateResult> {
    const { sessionId } = input;
    return this.softDelete({
      id: sessionId,
    });
  }
}
