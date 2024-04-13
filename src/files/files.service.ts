import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { Repository } from 'typeorm';
import { FileType } from './entities/file.entity';
import * as fs from 'fs-extra';
import { mainPath } from 'src/paths/mainPath';

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

  create(fileName: string, file: Express.Multer.File, userId: number) {
    return this.repository.save({
      fileName: fileName,
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

  async removeFilesFromDBAndFolder(req: Request) {
    const qb = this.repository.createQueryBuilder('files');
    const filesToDelete = await qb
      .withDeleted()
      .andWhere('files.deleteAt IS NOT NULL')
      .getMany(); // Get the files to delete

    if (filesToDelete.length > 0) {
      for (const file of filesToDelete) {
        const filePath = mainPath(file.fileName, req); // Construct the file path
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // Delete the file from the 'uploads' folder
        }
      }

      // Perform a soft-delete for the records in the database
      // await this.repository.softRemove(filesToDelete);
      console.log(filesToDelete);
      console.log('Files deleted from folder and database.');
    } else {
      console.log('No files found to delete.');
    }
  }

  async updateTextFile(filename: string, updatedText: string, req: Request) {
    try {
      const filePath = mainPath(filename, req);

      // Update the file content with the provided text
      const newText = updatedText;

      // Write the updated content back to the file
      await fs.writeFile(filePath, newText);
      // this.removeFilesFromDBAndFolder(req);

      return { message: 'Text file updated successfully' };
    } catch (error) {
      return { message: 'Failed to update text file', error };
    }
  }

  // createFolder(body: { folderName: string }, req: Request): string {
  //   const { folderName } = body;
  //   try {
  //     const folderPath = mainPath(folderName, req);
  //     fs.mkdirSync(folderPath);
  //     return `Folder "${body.folderName}" created successfully.`;
  //   } catch (error) {
  //     throw new HttpException(
  //       `Error creating folder: ${error.message}`,
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
}
