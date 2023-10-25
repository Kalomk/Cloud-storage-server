import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { Repository } from 'typeorm';
import { FileType } from './entities/file.entity';
import * as fs from 'fs-extra';
import { join } from 'path';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private repository: Repository<FileEntity>,
  ) {}

  findAll(userId: number, fileType: FileType) {
    const qb = this.repository.createQueryBuilder('files');

    qb.where('files.userId = :userId', { userId });

    switch (fileType) {
      case FileType.PHOTOS:
        qb.andWhere('files.mimetype LIKE :type', { type: 'image%' });
        break;

      case FileType.VIDEOS:
        qb.andWhere('files.mimetype LIKE :type', { type: 'video%' });
        break;

      case FileType.AUDIO:
        qb.andWhere('files.mimetype LIKE :type', { type: 'audio%' });
        break;

      case FileType.ARCHIVES:
        // Detect archive extensions
        const archiveExtensions = [
          'zip',
          'rar',
          '7z',
          'tar',
          'gz',
          'bz2',
          'xz',
        ];
        qb.andWhere('LOWER(files.originalName) LIKE ANY(:archiveExtensions)', {
          archiveExtensions: archiveExtensions.map((ext) => `%${ext}`),
        });
        break;

      case FileType.TEXTS:
        // Detect text-based extensions
        const textExtensions = [
          'txt',
          'html',
          'css',
          'js',
          'json',
          'xml',
          'csv',
          'md',
        ];
        qb.andWhere('LOWER(files.originalName) LIKE ANY(:textExtensions)', {
          textExtensions: textExtensions.map((ext) => `%${ext}`),
        });
        break;

      case FileType.PDFS:
        qb.andWhere('files.mimetype LIKE :type', { type: 'application/pdf' });
        break;

      case FileType.TRASH:
        qb.withDeleted().andWhere('files.deleteAt IS NOT NULL');
        break;

      default:
        break;
    }

    return qb.getMany();
  }

  create(file: Express.Multer.File, userId: number) {
    return this.repository.save({
      fileName: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      user: { id: userId },
    });
  }

  async remove(userId: number, ids: string) {
    const idsArray = ids.split(',');

    const qb = this.repository.createQueryBuilder('files');

    qb.where('id IN (:...ids) AND userId = :userId', {
      ids: idsArray,
      userId,
    });

    return qb.softDelete().execute();
  }

  async updateTextFile(filename: string, updatedText: string) {
    try {
      const filePath = join(__dirname, '..', '..', 'uploads', filename);

      // Update the file content with the provided text
      const newText = updatedText;

      // Write the updated content back to the file
      await fs.writeFile(filePath, newText);

      return { message: 'Text file updated successfully' };
    } catch (error) {
      return { message: 'Failed to update text file', error };
    }
  }

  createFolder(body: { folderName: string }): string {
    const { folderName } = body;
    try {
      const folderPath = join(__dirname, '..', '..', 'uploads', folderName);
      fs.mkdirSync(folderPath);
      return `Folder "${body.folderName}" created successfully.`;
    } catch (error) {
      throw new HttpException(
        `Error creating folder: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
