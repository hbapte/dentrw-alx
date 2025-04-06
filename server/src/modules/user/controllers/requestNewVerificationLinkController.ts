import { Request, Response } from 'express';
import User from '../../../database/models/user';
import sendVerificationEmail from '../utils/sendVerificationEmail';

const requestNewVerificationLinkController = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }
    const verificationToken = Math.random().toString(36).substring(7);
    user.emailVerificationToken = verificationToken;
    user.emailVerificationTokenCreated = new Date();
    await user.save();
    await sendVerificationEmail(email, verificationToken, user.names);
    res.status(200).json({ message: 'New verification link sent successfully' });
  } catch (error) {
    console.error('Error requesting new verification link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export { requestNewVerificationLinkController };
