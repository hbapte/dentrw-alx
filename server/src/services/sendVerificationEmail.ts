import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();


const sendVerificationEmail = async (email: string, verificationToken: string, names: string) => {
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + 24);
  const verificationUrl = `https://todo-express-server-0yda.onrender.com/api/auth/verify?token=${verificationToken}&expires=${expirationTime.getTime()}`;


  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.APP,
    },
  });

  const mailOptions = {
    from: 'ijbapte@gmail.com',
    to: email,
    subject: 'Email Verification - DentRW',
    html: `
      <p>Hello, ${names}</p>
      <p>Thanks for getting started with DentRW!</p>
      <p>Please click on the following link to verify your email address:</p>
      
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>If that doesn't work, copy and paste the following link in your browser:</p>

      <p>${verificationUrl}</p>

      <p>This link will expire in 24 hours.</p>


      <p>Thank you!</p> 
      <p>DentRW Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully.');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export default sendVerificationEmail;
