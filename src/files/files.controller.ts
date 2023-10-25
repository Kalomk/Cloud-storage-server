import {
  Controller,
  Post,
  Put,
  Body,
  Delete,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  Get,
  UseGuards,
  UseInterceptors,
  Query,
  Param,
  Req,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileStorage } from './storage';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JWTGuard } from 'src/auth/guard';
import { UserId } from 'src/decorators/user-id.decorator';
import { FileType } from './entities/file.entity';
import { FfmpegService } from 'src/ffmpeg/ffmpeg.service';
import { extname } from 'path';

@Controller('files')
@ApiTags('files')
@UseGuards(JWTGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly ffmpeg: FfmpegService,
  ) {}

  @Get('all')
  findAll(@UserId() userId: number, @Query('type') fileType: FileType) {
    return this.filesService.findAll(userId, fileType);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: fileStorage,
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
    @UploadedFile()
    file: Express.Multer.File,
    @UserId() userId: number,
  ) {
    const fileExtension = extname(file.originalname).toLowerCase();
    if (this.isVideoFile(fileExtension)) {
      await this.ffmpeg.makeShortVAndThumbnail(file.filename);
    }

    return this.filesService.create(file, userId);
  }

  private isVideoFile(fileExtension: string): boolean {
    const videoExtensions = ['.mp4', '.avi', '.mkv', '.ts', '.mpeg'];
    return videoExtensions.includes(fileExtension);
  }
  @Delete()
  remove(@UserId() userId: number, @Query('ids') ids: string) {
    return this.filesService.remove(userId, ids);
  }

  @Put('text/:textFilename')
  async updateTextFile(
    @Param('textFilename') textFilename: string,
    @Body() body: { text: string },
  ) {
    try {
      const { text } = body;
      console.log(text);
      const result = await this.filesService.updateTextFile(textFilename, text);
      return result;
    } catch (error) {
      return { message: 'Failed to update text file', error };
    }
  }
}
