import { EAssetStatus } from '@app/enums';
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

@Entity('assets')
export class AssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  key: string;

  @Column({ type: 'varchar' })
  mimeType: string;

  @Column({
    type: 'enum',
    enum: EAssetStatus,
    default: EAssetStatus.PROCESSING,
  })
  assetStatus: EAssetStatus;

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
