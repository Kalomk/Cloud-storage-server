import { Injectable, HttpStatus } from '@nestjs/common';
import { statSync, createReadStream } from 'fs';
import { Response } from 'express';
import { join } from 'path';

@Injectable()
export class VideoService {
  async getVideoStream(fileName: string, headers, res: Response) {
    const videoPath = join(__dirname, '..', '..', 'uploads', fileName);
    const { size } = statSync(videoPath);
    const videoRange = headers.range;
    if (videoRange) {
      const parts = videoRange.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
      const chunksize = end - start + 1;
      const readStreamfile = createReadStream(videoPath, {
        start,
        end,
        highWaterMark: 100,
      });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': chunksize,
      };
      res.writeHead(HttpStatus.PARTIAL_CONTENT, head); //206
      readStreamfile.pipe(res);
    } else {
      const head = {
        'Content-Length': size,
      };
      res.writeHead(HttpStatus.OK, head); //200
      createReadStream(videoPath).pipe(res);
    }
    console.log('streamed');
  }
}
