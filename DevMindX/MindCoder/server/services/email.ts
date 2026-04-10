import nodemailer from 'nodemailer';

// Check if we're in development mode
const isDev = process.env.NODE_ENV !== 'production';

// Create reusable transporter
const createTransporter = () => {
  // In development mode, we can use a test account or console log
  if (isDev && !process.env.FORCE_EMAIL) {
    console.log('Running in development mode - emails will be logged instead of sent');
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`FORCE_EMAIL: ${process.env.FORCE_EMAIL}`);
    return null;
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'webdevx.ai@gmail.com',
      pass: process.env.EMAIL_PASS || 'lqzflcmjmxfxmmf'
    }
  });
};

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5001'}/api/auth/verify?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'webdevx.ai@gmail.com',
    to: email,
    subject: 'Verify your DevMindX account',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #007acc; text-align: center;">Welcome to DevMindX</h1>
        <p>Thank you for signing up! Please verify your email address to activate your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #007acc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If you didn't create an account with DevMindX, you can safely ignore this email.
        </p>
        <p style="color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
      </div>
    `
  };

  try {
    const transporter = createTransporter();
    
    // In development mode, log the email instead of sending it
    if (!transporter) {
      console.log('==== VERIFICATION EMAIL (DEV MODE) ====');
      console.log(`To: ${email}`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log('=======================================');
      return;
    }
    
    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.error('Email error:', error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.BASE_URL || 'http://localhost:5001'}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'webdevx.ai@gmail.com',
    to: email,
    subject: 'Reset your DevMindX password',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #007acc; text-align: center;">Password Reset Request</h1>
        <p>You have requested to reset your password. Click the button below to set a new password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #007acc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 1 hour for security reasons.
        </p>
      </div>
    `
  };

  try {
    const transporter = createTransporter();
    
    // In development mode, log the email instead of sending it
    if (!transporter) {
      console.log('==== PASSWORD RESET EMAIL (DEV MODE) ====');
      console.log(`To: ${email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('=========================================');
      return;
    }
    
    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.error('Email error:', error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}

export async function sendOTPVerificationEmail(email: string, otp: string): Promise<void> {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'webdevx.ai@gmail.com',
    to: email,
    subject: 'Your DevMindX Verification Code',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #007acc; text-align: center;">Welcome to DevMindX</h1>
        <p>Thank you for signing up! Please use the verification code below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${otp}
          </div>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 14px;">
          If you didn't create an account with DevMindX, you can safely ignore this email.
        </p>
      </div>
    `
  };

  try {
    const transporter = createTransporter();
    
    // In development mode, log the email instead of sending it
    if (!transporter) {
      console.log('==== OTP VERIFICATION EMAIL (DEV MODE) ====');
      console.log(`To: ${email}`);
      console.log(`OTP Code: ${otp}`);
      console.log('===========================================');
      return;
    }
    
    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.error('Email error details:', error);
    throw new Error(`Failed to send OTP verification email: ${error.message}`);
  }
}