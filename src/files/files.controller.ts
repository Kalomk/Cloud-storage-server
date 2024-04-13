import {
  Controller,
  Post,
  Put,
  Body,
  Delete,
  UploadedFile,
  Get,
  UseGuards,
  UseInterceptors,
  Query,
  Param,
  Req,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileStorage, memorytorage, normalizeFileName } from './storage';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JWTGuard } from 'src/auth/guard';
import { UserId } from 'src/decorators/user-id.decorator';
import { FileType } from './entities/file.entity';
import { FfmpegService } from 'src/ffmpeg/ffmpeg.service';
import { extname } from 'path';
import { SharpService } from 'src/sharp/sharp.service';

@Controller('files')
@ApiTags('files')
@UseGuards(JWTGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly ffmpeg: FfmpegService,
    private readonly sharp: SharpService,
  ) {}

  @Get('all')
  findAll(@UserId() userId: number, @Query('type') fileType: FileType) {
    return this.filesService.findAll(userId, fileType);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memorytorage,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async create(
    // new ParseFilePipe({
    //   validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 })],
    // }),
    @Req() req,
    @UploadedFile()
    file: Express.Multer.File,
    @UserId() userId: number,
  ) {
    const fileExtension = extname(file.originalname).toLowerCase();
    const normalizeOriginalName = normalizeFileName(file);

    const savedFile = await this.filesService.create(
      normalizeOriginalName,
      file,
      userId,
    );

    if (this.isVideoFile(fileExtension)) {
      await this.ffmpeg.makeShortVAndThumbnail(normalizeOriginalName, req);
    }
    if (this.isImageFile(fileExtension)) {
      await this.sharp.resizeAndOptimizeImage(file, req, normalizeOriginalName);

      return savedFile;
    }

    await fileStorage(req, normalizeOriginalName, file);
    return savedFile;
  }

  private isVideoFile(fileExtension: string): boolean {
    const videoExtensions = ['.mp4', '.avi', '.mkv', '.ts', '.mpeg'];
    return videoExtensions.includes(fileExtension);
  }

  private isImageFile(fileExtension: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    return imageExtensions.includes(fileExtension);
  }
  @Delete()
  remove(@UserId() userId: number, @Query('ids') ids: string, @Req() req) {
    return this.filesService.remove(userId, ids);
  }

  @Put('text/:textFilename')
  async updateTextFile(
    @Param('textFilename') textFilename: string,
    @Body() body: { text: string },
    @Req() req,
  ) {
    try {
      const { text } = body;
      console.log(text);
      const result = await this.filesService.updateTextFile(
        textFilename,
        text,
        req,
      );
      return result;
    } catch (error) {
      return { message: 'Failed to update text file', error };
    }
  }
}
