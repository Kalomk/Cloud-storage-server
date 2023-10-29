import { join } from 'path';

export const thumbnailsP = (userReq) =>
  join(__dirname, '..', '..', 'uploads', userReq.user.fullName, 'thumbnails');
