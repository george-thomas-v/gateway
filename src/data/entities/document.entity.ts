import { EDocumentStatus } from '@app/enums';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('documents')
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  key: string;

  @Column({ type: 'varchar' })
  mimeType: string;

  @Column({
    type: 'enum',
    enum: EDocumentStatus,
    default: EDocumentStatus.PROCESSING,
  })
  documentStatus: EDocumentStatus;

  @Column({ type: 'varchar', nullable: true })
  objectURL: string | null;

  @ManyToOne(() => UserEntity, ({ asset }) => asset)
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
