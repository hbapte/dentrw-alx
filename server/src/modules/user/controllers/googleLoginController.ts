import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { findOrCreateUser } from '../repository/userRepository';

const client = new OAuth2Client('764242823639-703vf1ecmpol0cs7fkum57s26hrlii1j.apps.googleusercontent.com');

const googleLoginController = async (req: Request, res: Response) => {
  const { id_token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: '764242823639-703vf1ecmpol0cs7fkum57s26hrlii1j.apps.googleusercontent.com',
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Google token verification failed' });
    }

    const { sub: googleId, email, name, picture } = payload;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await findOrCreateUser({ googleId, email, name, picture });

    const token = jwt.sign({ userId: user._id }, '020d54824d694ac07ffe7779a843bbe3eb73a1a3bbf5d8f867b1ed3136b06396', { expiresIn: '1h' });

    res.cookie('jwt', token, { httpOnly: true });
    res.status(200).json({ message: 'Login successful', user, token });
  } catch (error) {
    console.error('Error verifying Google token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default googleLoginController;
