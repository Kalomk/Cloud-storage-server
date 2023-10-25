import { UserEntity } from 'src/users/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum FileType {
  PHOTOS = 'photos',
  TRASH = 'trash',
  VIDEOS = 'videos',
  TEXTS = 'texts',
  PDFS = 'pdfs',
  AUDIO = 'audio',
  ARCHIVES = 'archives',
}

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column()
  originalName: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @DeleteDateColumn()
  deleteAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.files)
  user: UserEntity;
}
