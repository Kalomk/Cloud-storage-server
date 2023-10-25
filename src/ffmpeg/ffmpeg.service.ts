import { Injectable } from '@nestjs/common';
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
import { join } from 'path';

@Injectable()
export class FfmpegService {
  constructor() {
    // Set the FFmpeg path using the injected configuration
    ffmpeg.setFfmpegPath(ffmpegPath);
  }

  async makeShortVAndThumbnail(fileName: string) {
    const inputPath = join(__dirname, '..', '..', 'uploads', fileName);
    const thumbnailsPath = join(__dirname, '..', '..', 'uploads', 'thumbnails');
    const VideoPreviewPath = join(
      __dirname,
      '..',
      '..',
      'uploads',
      `videoPreview-${fileName}`,
    );

    ffmpeg(inputPath)
      .format('mp4')
      .setStartTime('00:00:02')
      .duration(5)
      .on('end', function () {
        console.log('all video operations is over');
      })
      .save(VideoPreviewPath)
      .on('error', function (err) {
        console.error('error');
        console.error(err);
      })
      .takeScreenshots(
        {
          count: 1,
          timemarks: ['6'], // number of seconds
          filename: 'screenshot-%b.png',
        },
        thumbnailsPath,
      );
  }
}
