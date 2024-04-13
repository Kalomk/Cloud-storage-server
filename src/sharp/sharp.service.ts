import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { mainPath } from 'src/paths/mainPath';
import { normalizeFileName } from 'src/files/storage';

@Injectable()
export class SharpService {
  async resizeAndOptimizeImage(
    image: Express.Multer.File,
    req,
    fileName: string,
  ) {
    const savePath = mainPath(fileName, req);
    try {
      await sharp(image.buffer)
        .resize(800)
        .webp({ effort: 3 })
        .toFile(savePath);
      console.log('Image resized and optimized successfully!');
    } catch (error) {
      console.error('Error resizing and optimizing image:', error);
    }
  }
}
