import nodemailer from 'nodemailer';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Create a transporter using SMTP with secure settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  secure: true,
  tls: {
    rejectUnauthorized: false
  }
});

// Test the email configuration
const testEmailConfig = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || !process.env.CLIENT_URL) {
      console.error('Missing email configuration:', {
        EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Set' : 'Missing',
        CLIENT_URL: process.env.CLIENT_URL ? 'Set' : 'Missing'
      });
      return false;
    }
    
    // Verify the connection configuration
    await transporter.verify();
    console.log('Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email configuration verification failed:', error);
    return false;
  }
};

// Function to generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Function to send forgot password email
export const sendForgotPasswordEmail = async (email: string, username: string) => {
  try {
    // Verify email configuration
    const configValid = await testEmailConfig();
    if (!configValid) {
      return { success: false, message: 'Email service not properly configured' };
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await db.update(users)
      .set({
        resetToken,
        resetTokenExpiry,
      })
      .where(eq(users.email, email));

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    console.log(`Generated reset URL: ${resetUrl}`);

    // Email content
    const mailOptions = {
      from: `"GoalCast" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - GoalCast',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Hello ${username},</h1>
          <p>You requested a password reset for your GoalCast account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `,
    };

    // Send email
    console.log(`Attempting to send email to: ${email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, message: 'Password reset email sent successfully' };
  } catch (error) {
    console.error('Error sending forgot password email:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to send password reset email' 
    };
  }
};

// Function to verify reset token
export const verifyResetToken = async (token: string) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.resetToken, token),
    });

    if (!user) {
      return { success: false, message: 'Invalid reset token' };
    }

    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      return { success: false, message: 'Reset token has expired' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return { success: false, message: 'Failed to verify reset token' };
  }
};

// Function to reset password
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const result = await verifyResetToken(token);
    
    if (!result.success) {
      return result;
    }

    // Update password and clear reset token
    await db.update(users)
      .set({
        password: newPassword, // Note: Make sure to hash the password before storing
        resetToken: null,
        resetTokenExpiry: null,
      })
      .where(eq(users.resetToken, token));

    return { success: true, message: 'Password reset successfully' };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, message: 'Failed to reset password' };
  }
}; 