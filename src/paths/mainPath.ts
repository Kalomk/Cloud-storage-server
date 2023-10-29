import { join } from 'path';

export const mainPath = (name, userReq) =>
  join(__dirname, '..', '..', 'uploads', userReq.user.fullName, name);
