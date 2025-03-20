import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EUserRoles } from '../enums';
import { PasswordEntity } from './password.entity';
import { SessionEntity } from './session.entity';
import { DocumentEntity } from './document.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'enum', enum: EUserRoles, default: EUserRoles.VIEWER })
  role: EUserRoles;

  @Column({ type: 'varchar', nullable: true })
  blockedReason: string | null;

  @Column({ type: 'date', nullable: true })
  blockedAt: Date | null;

  @OneToMany(() => PasswordEntity, ({ user }) => user, {
    onDelete: 'CASCADE',
  })
  password: PasswordEntity[];

  @OneToMany(() => SessionEntity, ({ user }) => user, {
    onDelete: 'CASCADE',
  })
  session: SessionEntity[];

  @OneToMany(() => DocumentEntity, ({ user }) => user, {
    onDelete: 'CASCADE',
  })
  asset: DocumentEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
