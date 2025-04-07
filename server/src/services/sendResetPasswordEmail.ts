import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendResetPasswordEmail = async (email: string, resetToken: string) => {
    const resetUrl = `https://todo-express-server-0yda.onrender.com/api/auth/verify-reset-token?token=${resetToken}`;

  
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER,
        pass: process.env.APP,
      },
    });
  
    const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: 'Reset Password',
      html: `
        <p>You are receiving this email because you (or someone else) has requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>

        <p>Thanks!</p>
        <p>DentRW team</p>
      `,
    };
  
    await transporter.sendMail(mailOptions);
  };
  

  export default sendResetPasswordEmail;