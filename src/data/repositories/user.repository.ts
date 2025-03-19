import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PasswordEntity, SessionEntity, UserEntity } from '../entities';
import {
  DataSource,
  EntityManager,
  EntityTarget,
  Repository,
  UpdateResult,
} from 'typeorm';
import { RegisterCredentialsDto } from 'src/features/auth/dto';
import { EUserRoles } from '@app/enums';
import { BlocUnblockkUserParamDto } from 'src/features/user/dto';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(
    @Optional() _target: EntityTarget<UserEntity>,
    entityManager: EntityManager,
    private readonly dataSource: DataSource,
  ) {
    super(UserEntity, entityManager);
  }

  async getUserAndPassword(input: { email: string }): Promise<UserEntity> {
    const { email } = input;
    const user = await this.findOne({
      where: {
        email,
      },
      relations: {
        password: true,
      },
    });
    if (!user) throw new NotFoundException('No user found');
    return user;
  }

  async getUserAndSession(input: { userId: string }): Promise<UserEntity> {
    const { userId } = input;
    const user = await this.findOne({
      where: {
        id: userId,
      },
      relations: {
        session: true,
      },
    });
    if (!user) throw new NotFoundException('No user found');
    return user;
  }

  async getExistingUser(input: { email: string }): Promise<UserEntity | null> {
    const { email } = input;
    return this.findOneBy({ email });
  }

  async createUserAndPassword(
    input: RegisterCredentialsDto,
  ): Promise<UserEntity> {
    const { email, password, firstName, lastName } = input;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = queryRunner.manager.getRepository(UserEntity).create({
        email,
        firstName,
        lastName,
      });
      await queryRunner.manager.save(user);
      await queryRunner.manager.getRepository(PasswordEntity).insert({
        password,
        user: { id: user.id },
      });
      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async changeUserRole(input: {
    userId: string;
    role: EUserRoles;
  }): Promise<UpdateResult> {
    const { userId, role } = input;
    return this.update(
      { id: userId },
      {
        role,
      },
    );
  }

  async blockUser(input: {
    blockedReason: string;
    userId: string;
  }): Promise<Date> {
    const { userId, blockedReason } = input;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const blockedAt = new Date();
      await queryRunner.manager.getRepository(UserEntity).update(
        { id: userId },
        {
          blockedAt,
          blockedReason,
        },
      );
      await queryRunner.manager.getRepository(SessionEntity).softDelete({
        user: { id: userId },
      });
      await queryRunner.commitTransaction();
      return blockedAt;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async unblockUser(input: { userId: string }): Promise<UpdateResult> {
    const { userId } = input;
    return this.update(
      { id: userId },
      {
        blockedAt: null,
        blockedReason: null,
      },
    );
  }
}
