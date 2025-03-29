import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { LoginUserDto, SignUpUserDto, UserKYCSetUpDto, VerifyUserEmailDto } from '../dtos/auth.dto';
import { Routes } from '../interfaces/routes.interface';
import { ValidationMiddleware } from '../middlewares/validation.middleware';
import { UserAuthMiddleware } from '../middlewares/userAuth.middleware';

export class AuthRoute implements Routes {
  public router = Router();
  public auth = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/auth/user/signup', ValidationMiddleware(SignUpUserDto), this.auth.signUpUser);
    this.router.post('/auth/user/login', ValidationMiddleware(LoginUserDto), this.auth.loginUser);
    this.router.post('/auth/user/kyc/verification', ValidationMiddleware(UserKYCSetUpDto), this.auth.setKycForUser);
    this.router.post('/auth/user/verify-sms', UserAuthMiddleware(), ValidationMiddleware(VerifyUserEmailDto), this.auth.verifySMSOTPForUser);
    // this.router.post('/auth/user/forgot-password', ValidationMiddleware(RequestUserEmailOtpDto), this.auth.requestEmailOtpForUser);
    this.router.post(
      '/auth/user/phone/otp/verify',
      UserAuthMiddleware(),
      ValidationMiddleware(VerifyUserEmailDto),
      this.auth.verifyCodeForPasswordChangeForUser,
    );
    this.router.post('/auth/user/password/reset', UserAuthMiddleware(), ValidationMiddleware(VerifyUserEmailDto), this.auth.resetUserPassword);
  }
}
