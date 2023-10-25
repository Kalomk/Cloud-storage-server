import { FileEntity } from 'src/files/entities/file.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  fullName: string;

  @Column()
  hash: string;

  @OneToMany(() => FileEntity, (file) => file.user)
  files: FileEntity[];
}
