import { memoryStorage } from 'multer';
import * as fs from 'fs-extra';

const generateId = () =>
  Array(18)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');

export const normalizeFileName = (file: Express.Multer.File) => {
  const fileExtName = file.originalname.split('.').pop();
  return `${generateId()}.${fileExtName}`;
};

export const fileStorage = async (
  req: Request,
  fileName: string,
  file: Express.Multer.File,
) => {
  const userFullName = (req as any).user.fullName;
  const uploadPath = `./uploads/${userFullName}`;
  // Check if the directory exists and create it if it doesn't
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  const filePath = `${uploadPath}/${fileName}`;
  await fs.writeFile(filePath, file.buffer);
};

export const memorytorage = memoryStorage();
