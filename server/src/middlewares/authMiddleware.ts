const jwt = require('jsonwebtoken');
const passport = require('passport');
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';


import { Request, Response, NextFunction } from 'express';
import User from "../database/models/user";

// Configure Passport.js JWT strategy
const jwtSecret = process.env.JWT_SECRET || ''; // Provide a default value if JWT_SECRET is undefined

passport.use(new JwtStrategy({
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}, (payload, done) => {
  User.findById(payload.userId)
    .then(user => {
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
    .catch(error => done(error, false));
}));

// Custom request interface
interface CustomRequest extends Request {
  userId?: string;
}

// Middleware function for authentication
const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error | null, user: { _id: string | undefined; }) => {
    if (err || !user) {
      return res.redirect('/?sessionExpired=true');
    }
    req.userId = user._id; // Set user ID in request
    next();
  })(req, res, next);
};

export default authMiddleware;