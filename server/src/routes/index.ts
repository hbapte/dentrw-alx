import express from 'express';
import authRouter from './authRoutes';
import profileRouter from './profileRoutes';
import MFArouter from './twoFactorAuthRoutes';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/profile', profileRouter); 
router.use('/2fa', MFArouter);

export default router;

