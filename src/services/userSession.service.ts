import { sign, verify } from 'jsonwebtoken';
import { Service } from 'typedi';
import { SECRET_KEY } from '../config';
import httpStatus from 'http-status';
import { HttpException } from '../utils/httpException';
import { TokenObj } from '../interfaces/auth.interface';
import { DataStoredInUserSession, UserSessionType, UserSessionTypes } from '../types/auth.types';
import { UserSession, User } from '../models';

type GenerateSessionBody = {
  expires?: number;
  userId: string;
  type: UserSessionType;
};

@Service()
export class UserSessionService {
  generateSessionToken = ({ userId, expires, type }: GenerateSessionBody): string => {
    const dataStoredInToken: DataStoredInUserSession = {
      sub: userId,
      iat: Date.now(),
      exp: expires || Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      type,
    };

    return sign(dataStoredInToken, SECRET_KEY);
  };

  public generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  public async saveSession(tokenBody: Partial<UserSession>): Promise<UserSession> {
    tokenBody.expiresAt = tokenBody.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return (await UserSession.create({
      ...tokenBody,
    })) as UserSession;
  }

  public async verifySession(token: string, type: UserSessionType) {
    const payload = verify(token, SECRET_KEY) as unknown as DataStoredInUserSession;

    const sessionData = await UserSession.findOne({
      where: {
        token,
        type,
        userId: payload.sub,
        expiresAt: new Date(payload.exp),
      },
    });

    if (!sessionData) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Session not found or expired');
    }

    return sessionData;
  }

  public async generateAuthSession(user: User): Promise<{
    access: TokenObj;
    refresh: TokenObj;
  }> {
    const tokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const accessToken = this.generateSessionToken({
      userId: user.id,
      type: UserSessionTypes.ACCESS,
      expires: tokenExpires.getTime(),
    });

    const refreshTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const refreshToken = this.generateSessionToken({
      userId: user.id,
      type: UserSessionTypes.REFRESH,
      expires: refreshTokenExpires.getTime(),
    });

    await this.saveSession({
      token: accessToken,
      expiresAt: tokenExpires,
      type: UserSessionTypes.ACCESS,
      userId: user.id,
    });

    await this.saveSession({
      token: refreshToken,
      expiresAt: refreshTokenExpires,
      type: UserSessionTypes.REFRESH,
      userId: user.id,
    });

    return {
      access: { token: accessToken, expires: tokenExpires },
      refresh: { token: refreshToken, expires: refreshTokenExpires },
    };
  }

  public async generateResetPasswordSessionToken(email: string): Promise<string> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new HttpException(httpStatus.NOT_FOUND, 'User not found');
    }

    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const token = this.generateSessionToken({
      userId: user.id,
      type: UserSessionTypes.RESET_PASSWORD,
      expires: expires.getTime(),
    });

    await this.saveSession({
      token,
      userId: user.id,
      expiresAt: expires,
      type: UserSessionTypes.RESET_PASSWORD,
    });

    return token;
  }

  public async generateVerifyEmailSessionToken(user: User, userType: string, code: string): Promise<string> {
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const token = this.generateSessionToken({
      userId: user.id,
      type: UserSessionTypes.VERIFY_EMAIL,
      expires: expires.getTime(),
    });

    await this.saveSession({
      token,
      userId: user.id,
      email: user?.email,
      otp: code,
      expiresAt: expires,
      type: UserSessionTypes.VERIFY_EMAIL,
    });

    return token;
  }

  public async generateSetKycSessionToken(user: User): Promise<string> {
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const token = this.generateSessionToken({
      userId: user.id,
      type: UserSessionTypes.SET_KYC,
      expires: expires.getTime(),
    });

    await this.saveSession({
      token,
      userId: user.id,
      expiresAt: expires,
      type: UserSessionTypes.SET_KYC,
    });

    return token;
  }

  public async generateVerifyPhoneSessionToken(user: User, code: string): Promise<string> {
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const token = this.generateSessionToken({
      userId: user.id,
      type: UserSessionTypes.VERIFY_PHONE,
      expires: expires.getTime(),
    });

    await this.saveSession({
      token,
      userId: user.id,
      phone: user?.phoneNumber,
      otp: code,
      expiresAt: expires,
      type: UserSessionTypes.VERIFY_PHONE,
    });

    return token;
  }
}
