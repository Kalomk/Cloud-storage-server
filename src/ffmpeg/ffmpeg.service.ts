import { Injectable } from '@nestjs/common';
import { mainPath } from 'src/paths/mainPath';
import { thumbnailsP } from 'src/paths/thumbnailsPath';
import * as fs from 'fs-extra';
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

@Injectable()
export class FfmpegService {
  constructor() {
    // Set the FFmpeg path using the injected configuration
    ffmpeg.setFfmpegPath(ffmpegPath);
  }

  async makeShortVAndThumbnail(fileName: string, req) {
    const thumbnailsPath = thumbnailsP(req);
    const inputPath = mainPath(fileName, req);
    const VideoPreviewPath = mainPath(`videoPreview-${fileName}`, req);

    if (!fs.existsSync(thumbnailsPath)) {
      fs.mkdirSync(thumbnailsPath, { recursive: true });
    }
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
