import { Request, Response } from 'express';
import { findUserByEmail, comparePasswords } from '../repository/loginRepository';
import jwt from 'jsonwebtoken';

const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
  
    if (!user.emailVerified) {
      return res.status(401).json({ error: 'Please verify your email before logging in' });
    }

    if (user.googleId) {
      return res.status(400).json({ error: 'Please use Google Sign-In to log in.' });
    }
  
    if (!user.password || !password) {
      return res.status(401).json({ error: 'Password is required' });
    }

    const passwordMatch = await comparePasswords(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    const token = jwt.sign({ userId: user._id }, '020d54824d694ac07ffe7779a843bbe3eb73a1a3bbf5d8f867b1ed3136b06396' , { expiresIn: '1h' });

    res.cookie('jwt', token, { httpOnly: true });

    res.status(200).json({ message: 'Login successful', user: user, token: token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default loginController;
