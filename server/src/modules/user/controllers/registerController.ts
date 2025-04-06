import { Request, Response } from 'express';
import User from '../../../database/models/user';
import bcrypt from 'bcrypt'; 
import sendVerificationEmail from '../utils/sendVerificationEmail';

const registerController = async (req: Request, res: Response) => {
  const { names, email, username, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    const verificationToken = Math.random().toString(36).substring(7);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ names, email, username, password: hashedPassword, emailVerificationToken: verificationToken, emailVerificationTokenCreated: new Date() });
    await newUser.save();
    await sendVerificationEmail(email, verificationToken, names);
    res.status(201).json({ message: 'User registered successfully. Please check your email for verification.' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { registerController };
