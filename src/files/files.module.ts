import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { FfmpegModule } from 'src/ffmpeg/ffmpeg.module';
import { SharpModule } from 'src/sharp/sharp.module';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [TypeOrmModule.forFeature([FileEntity]), FfmpegModule, SharpModule],
})
export class FilesModule {}
