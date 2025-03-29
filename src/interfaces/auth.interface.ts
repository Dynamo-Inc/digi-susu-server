import { Request } from 'express';
import { User } from '../models';
import { TokenType } from '../types/auth.types';

export interface DataStoredInToken {
  sub: string;
  iat: number;
  exp: number;
  phone?: string;
  userType: string;
  otp?: string;
  type: TokenType;
}

export interface TokenData {
  token: string;
  expiresAt: Date;
  userId: string;
  userType: 'provider' | 'user' | string;
  otp?: string;
  phone?: string;
  type: TokenType;
}

export interface TokenObj {
  token: string;
  expires: Date;
}

export interface RequestWithUser extends Request {
  user: User;
}

export interface RequestWithUserAndFile extends RequestWithUser {
  file: any;
  files: any[];
}
