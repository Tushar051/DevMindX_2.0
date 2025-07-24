import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { storage } from '../storage';
import type { User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM";
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "86400000";

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: parseInt(JWT_EXPIRATION) }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function generateOTP(): string {
  // Generate a 6-digit numeric OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPExpiry(): Date {
  // OTP expires in 10 minutes
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + 10);
  return expiryDate;
}

export async function authenticateUser(email: string, password: string): Promise<User> {
  const user = await storage.getUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.isVerified) {
    throw new Error('Please verify your email before logging in');
  }

  if (!user.password) {
    throw new Error('Please set a password or use OAuth login');
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid password');
  }

  return user;
}
