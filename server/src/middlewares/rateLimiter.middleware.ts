import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis, RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import httpStatus from 'http-status';
import redisClient from '../config/redis.config';

// Create a Redis rate limiter if Redis is available, otherwise use memory
const getRateLimiter = (options: {
  keyPrefix: string;
  points: number;
  duration: number;
}) => {
  const { keyPrefix, points, duration } = options;
  
  if (redisClient && redisClient.status === 'ready') {
    return new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix,
      points,      // Number of points
      duration,    // Per seconds
      blockDuration: duration, // Block for the same duration
    });
  } else {
    console.warn(`Redis not available for rate limiting (${keyPrefix}), using memory instead`);
    return new RateLimiterMemory({
      keyPrefix,
      points,
      duration,
    });
  }
};

// Generic rate limiter middleware
export const createRateLimiter = (options: {
  keyPrefix: string;
  points: number;
  duration: number;
  message?: string;
}) => {
  const { keyPrefix, points, duration, message = 'Too many requests, please try again later.' } = options;
  const limiter = getRateLimiter({ keyPrefix, points, duration });
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Create a unique key based on IP
      const key = req.ip || ''; // Fallback to an empty string if req.ip is undefined
      
      // Check rate limit
      await limiter.consume(key);
      next();
    } catch (error) {
      if (error instanceof RateLimiterRes) {
        // Rate limit exceeded
        const retryAfter = Math.ceil(error.msBeforeNext / 1000) || 1;
        
        res.set('Retry-After', String(retryAfter));
        
        return res.status(httpStatus.TOO_MANY_REQUESTS).json({
          status: httpStatus.TOO_MANY_REQUESTS,
          message,
          data: {
            retryAfter
          }
        });
      }
      
      // If there's an error with rate limiting, allow the request to proceed
      console.error('Rate limiter error:', error);
      next();
    }
  };
};

// Rate limiter for login attempts
export const loginRateLimiter = createRateLimiter({
  keyPrefix: 'rl:login',
  points: 5,           // 5 login attempts
  duration: 15 * 60,   // per 15 minutes
  message: 'Too many login attempts, please try again after 15 minutes.'
});

// Rate limiter for registration
export const registrationRateLimiter = createRateLimiter({
  keyPrefix: 'rl:register',
  points: 20,           // 3 registration attempts
  duration: 60 * 60,   // per hour
  message: 'Too many registration attempts, please try again after 1 hour.'
});

// Rate limiter for password change
export const passwordChangeRateLimiter = createRateLimiter({
  keyPrefix: 'rl:pwchange',
  points: 5,           // 5 password change attempts
  duration: 60 * 60,   // per hour
  message: 'Too many password change attempts, please try again after 1 hour.'
});


// Rate limiter for forgot password
export const forgotPasswordRateLimiter = createRateLimiter({
  keyPrefix: 'rl:forgotpw',
  points: 5,           // 5 forgot password attempts
  duration: 60 * 60,   // per hour
  message: 'Too many forgot password attempts, please try again after 1 hour.'
});


// Rate limiter for password reset
export const passwordResetRateLimiter = createRateLimiter({
  keyPrefix: 'rl:pwreset',
  points: 3,           // 3 password reset attempts
  duration: 60 * 60,   // per hour
  message: 'Too many password reset attempts, please try again after 1 hour.'
});



// General API rate limiter
export const apiRateLimiter = createRateLimiter({
  keyPrefix: 'rl:api',
  points: 60,          // 60 requests
  duration: 60,        // per minute
  message: 'Too many requests, please try again after 1 minute.'
});
