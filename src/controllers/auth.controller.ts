import { Request, Response } from 'express';
import { Container } from 'typedi';
import { AuthService } from '../services/auth.service';
import catchAsync from '../utils/catchAsync';

import httpStatus from 'http-status';
import { RequestWithUser } from '../interfaces/auth.interface';
import { LoginUserDto, ResetPasswordUserDto, SignUpUserDto, UserKYCSetUpDto, VerifyUserEmailDto } from '../dtos/auth.dto';

export class AuthController {
  public auth = Container.get(AuthService);

  public signUpUser = catchAsync(async (req: RequestWithUser, res: Response) => {
    const userData: SignUpUserDto = req.body;

    const signupData = await this.auth.signUpUser(userData);
    res.status(httpStatus.CREATED).send(signupData);
  });

  public loginUser = catchAsync(async (req: Request, res: Response) => {
    const userData: LoginUserDto = req.body;

    const loginData = await this.auth.loginUser(userData);
    res.status(httpStatus.OK).send(loginData);
  });

  public verifyEmailOTPForUser = catchAsync(async (req: RequestWithUser, res: Response) => {
    const userData: VerifyUserEmailDto = req.body;

    const verifyData = await this.auth.verifyEmailOTPForUser(req?.user?.id, req?.user?.email, userData?.code);
    res.status(httpStatus.OK).send(verifyData);
  });

  public setKycForUser = catchAsync(async (req: RequestWithUser, res: Response) => {
    const userData: UserKYCSetUpDto = req.body;

    const verifyData = await this.auth.setKycForUser(req?.user?.id, userData);
    res.status(httpStatus.OK).send(verifyData);
  });

  public verifySMSOTPForUser = catchAsync(async (req: RequestWithUser, res: Response) => {
    const userData: VerifyUserEmailDto = req.body;

    const verifyData = await this.auth.verifySMSOTPForUser(req?.user?.id, req?.user?.phoneNumber, userData?.code);
    res.status(httpStatus.OK).send(verifyData);
  });

  public verifyCodeForPasswordChangeForUser = catchAsync(async (req: RequestWithUser, res: Response) => {
    const userData: VerifyUserEmailDto = req.body;

    const verifyData = await this.auth.verifyCodeForPasswordChangeForUser(req?.user?.id, req?.user?.email, userData?.code);
    res.status(httpStatus.NO_CONTENT).send(verifyData);
  });

  public resetUserPassword = catchAsync(async (req: RequestWithUser, res: Response) => {
    const userData: ResetPasswordUserDto = req.body;

    const resetData = await this.auth.resetUserPassword(req?.user?.id, userData);
    res.status(httpStatus.NO_CONTENT).send(resetData);
  });
}
