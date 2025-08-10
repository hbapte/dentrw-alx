import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;

  if (token) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt.verify(token, '020d54824d694ac07ffe7779a843bbe3eb73a1a3bbf5d8f867b1ed3136b06396', (err: any) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized' });
      } else {
        next();
      }
    });
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
