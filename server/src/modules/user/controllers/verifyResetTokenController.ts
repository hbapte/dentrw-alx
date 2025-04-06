import { Request, Response } from 'express';
import User from '../../../database/models/user';

const verifyResetTokenController = async (req: Request, res: Response) => {
  const token: string = req.query.token as string;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect('https://todo-react-eight-eta.vercel.app/forgot-password?error=Invalid or expired token, please request a new one!');
    }

    return res.redirect(`https://todo-react-eight-eta.vercel.app/reset-password?token=${token}`);
  } catch (error) {
    console.error('Error verifying reset password token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default verifyResetTokenController;
