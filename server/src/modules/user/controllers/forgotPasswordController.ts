import { Request, Response } from 'express';
import crypto from 'crypto';
import sendResetPasswordEmail from '../utils/sendResetPasswordEmail';
import User from '../../../database/models/user';

const forgotPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found, please create account first' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); 
    await user.save();

    await sendResetPasswordEmail(email, resetToken);
    res.status(200).json({ message: 'Password reset email sent successfully.' });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default forgotPasswordController;
