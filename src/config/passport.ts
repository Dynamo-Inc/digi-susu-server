import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { SECRET_KEY } from './../config';
import { DataStoredInUserSession, UserSessionTypes } from '../types/auth.types';
import { Passport } from 'passport';
import { User } from '../models';

export const providerPassport = new Passport();
export const userPassport = new Passport();

const userJwtOptions = {
  secretOrKey: SECRET_KEY,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

export const userJwtVerify = async (payload: DataStoredInUserSession, done) => {
  try {
    if (
      payload.type !== UserSessionTypes.ACCESS &&
      payload.type !== UserSessionTypes.VERIFY_EMAIL &&
      payload.type !== UserSessionTypes.RESET_PASSWORD &&
      payload.type !== UserSessionTypes.VERIFY_PHONE &&
      payload.type !== UserSessionTypes.SET_KYC
    ) {
      throw new Error('Invalid token type');
    }
    const user = await User.findByPk(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

export const userJwtStrategy = new JwtStrategy(userJwtOptions, userJwtVerify);
