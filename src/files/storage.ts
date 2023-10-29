import { diskStorage } from 'multer';
import * as fs from 'fs-extra';

const generateId = () =>
  Array(18)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');

const normalizeFileName = (req, file: Express.Multer.File, callback) => {
  const fileExtName = file.originalname.split('.').pop();
  callback(null, `${generateId()}.${fileExtName}`);
};

export const fileStorage = diskStorage({
  destination: (req, file, callback) => {
    const userFullName = (req as any).user.fullName;
    const uploadPath = `./uploads/${userFullName}`;
    // Check if the directory exists and create it if it doesn't
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    callback(null, uploadPath);
  },
  filename: normalizeFileName,
});
