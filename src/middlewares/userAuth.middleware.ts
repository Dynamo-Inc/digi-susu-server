import { NextFunction, Response } from 'express';
import { RequestWithUser } from '../interfaces/auth.interface';
import { HttpException } from '../utils/httpException';
import httpStatus from 'http-status';
import { userPassport } from '../config/passport';
import { ALL_ROLES, ROLE_RIGHTS } from '../config/roles';

const AUTH_ERR_MSG = 'Please authenticate';

const verifyCallback = (req: RequestWithUser, resolve, reject, requiredRights?: string[]) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new HttpException(httpStatus.UNAUTHORIZED, AUTH_ERR_MSG));
  }

  req.user = user;

  if (requiredRights && requiredRights.length && !user.role) {
    return reject(new HttpException(httpStatus.FORBIDDEN, 'Forbidden'));
  }

  // Check role-based access control if required
  if (requiredRights && requiredRights.length) {
    const userRights = ROLE_RIGHTS.get(user.role);
    const hasRequiredRights = requiredRights.every(requiredRight => userRights.includes(requiredRight as any));
    if (!hasRequiredRights) {
      return reject(new HttpException(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }
  resolve();
};

const _requiredRights = Object.values(ALL_ROLES)
  .map(role => role)
  .flat()
  .filter((role, index, self) => self.indexOf(role) === index);

type RequiredRights = typeof _requiredRights;

export const UserAuthMiddleware =
  (...requiredRights: RequiredRights) =>
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    return new Promise((resolve, reject) => {
      userPassport.authenticate('user', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch(err => next(err));
  };

export const validateInvitationToken = async (req: RequestWithUser, resolve, reject) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new HttpException(httpStatus.UNAUTHORIZED, 'You need to be invited by an organization'));
  }

  req.user = user;

  resolve();
};

export const InvitationAuthMiddleware = () => async (req: RequestWithUser, res: Response, next: NextFunction) => {
  return new Promise((resolve, reject) => {
    userPassport.authenticate('user', { session: false }, validateInvitationToken(req, resolve, reject))(req, res, next);
  })
    .then(() => next())
    .catch(err => next(err));
};
