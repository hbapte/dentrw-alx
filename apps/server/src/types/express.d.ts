//server\src\types\express.d.ts
import { User } from '../database/models/user';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      startTime?: number
    }
  }
     namespace Multer {
      interface File {
        filename?: string // Cloudinary public ID
        path: string // Cloudinary URL
      }
    }
}


export {};