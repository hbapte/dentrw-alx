import { Request, Response } from 'express';
import User from '../../../database/models/user';

const verifyEmailController = async (req: Request, res: Response) => {
  const token: string | undefined = req.query.token as string;

  try {
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return res.redirect('https://todo-react-eight-eta.vercel.app/request-email-token?error=Invalid verification token');
    }

    const expirationTime = parseInt(req.query.expires as string);
    if (isNaN(expirationTime) || expirationTime < Date.now()) {
      return res.redirect('https://todo-react-eight-eta.vercel.app/request-email-token?error=Verification link has expired');
    }

    user.emailVerified = true;
    user.emailVerificationToken = ''; 
    await user.save();

    res.redirect('https://todo-react-eight-eta.vercel.app/login?emailVerifiedSuccessfully=true');
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default verifyEmailController;
