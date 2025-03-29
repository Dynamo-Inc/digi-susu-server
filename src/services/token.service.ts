import { sign, verify } from 'jsonwebtoken';
import Container, { Service } from 'typedi';
import { SECRET_KEY } from '../config';
import { DataStoredInToken, TokenData, TokenObj } from '../interfaces/auth.interface';
import httpStatus from 'http-status';
import { HttpException } from '../utils/httpException';
import { TokenType, TokenTypes } from '../types/auth.types';
import { Token, User } from '../models';
import { UserService } from './users.service';

type GenerateTokenBody = {
  expires?: number;
  userId: string;
  userType: string;
  type: TokenType;
  phone?: string;
  otp?: string;
};

@Service()
export class TokenService {
  public _users = Container.get(UserService);

  generateToken = ({ expires, userId, type, phone, userType }: GenerateTokenBody): string => {
    const dataStoredInToken: DataStoredInToken = {
      sub: userId,
      phone: phone || '',
      otp: '',
      userType,
      iat: Date.now(),
      exp: expires || Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      type,
    };

    return sign(dataStoredInToken, SECRET_KEY);
  };

  public generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  public async saveToken(tokenBody: TokenData): Promise<Token> {
    tokenBody.expiresAt = tokenBody.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    return await Token.create({
      ...tokenBody,
    });
  }

  public async verifyToken(token: string, type: TokenType) {
    const payload = verify(token, SECRET_KEY) as unknown as DataStoredInToken;

    const tokenData = await Token.findOne({
      where: {
        token,
        type,
        userId: payload.sub,
        expiresAt: new Date(payload.exp),
      },
    });

    if (!tokenData) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Token not found or expired');
    }

    return tokenData;
  }

  public async generateAuthTokens(
    user: User,
    userType: string,
  ): Promise<{
    access: TokenObj;
    refresh: TokenObj;
  }> {
    const tokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const accessToken = this.generateToken({
      userId: user.id,
      userType,
      type: TokenTypes.ACCESS,
      expires: tokenExpires.getTime(),
    });
    const refreshTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const refreshToken = this.generateToken({
      userId: user.id,
      userType,
      type: TokenTypes.REFRESH,
      expires: refreshTokenExpires.getTime(),
    });

    await this.saveToken({
      token: accessToken,
      userId: user.id,
      userType,
      expiresAt: tokenExpires,
      type: TokenTypes.ACCESS,
    });
    await this.saveToken({
      token: refreshToken,
      userId: user.id,
      userType,
      expiresAt: refreshTokenExpires,
      type: TokenTypes.REFRESH,
    });

    return {
      access: { token: accessToken, expires: tokenExpires },
      refresh: { token: refreshToken, expires: refreshTokenExpires },
    };
  }

  public async generateVerifyEmailToken(user: User, userType: string, code: string): Promise<string> {
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const token = this.generateToken({
      userId: user.id,
      userType,
      otp: code,
      type: TokenTypes.VERIFY_EMAIL,
      expires: expires.getTime(),
    });

    await this.saveToken({ token, userId: user.id, userType, expiresAt: expires, type: TokenTypes.VERIFY_EMAIL });

    return token;
  }
}
