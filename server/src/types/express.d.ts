//server\src\types\express.d.ts
import { User } from '../database/models/user';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      startTime?: number
    }
  }
}


export {};