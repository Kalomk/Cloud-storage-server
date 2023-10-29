import { Header, Res, Headers, Param, Controller, Get } from '@nestjs/common';
import { VideoService } from './video.service';

@Controller('video')
export class VideoController {
  constructor(private videoService: VideoService) {}
  @Get('stream/:fileName')
  @Header('Accept-Ranges', 'bytes')
  @Header('Content-Type', 'video/mp4')
  async getVideoStream(
    @Param('fileName') fileName: string,
    @Headers() headers,
    @Res() res,
  ) {
    return this.videoService.getVideoStream(fileName, headers, res);
  }
}
