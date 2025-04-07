import { User } from '../database/models/user';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
