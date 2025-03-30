import { hash, compare } from 'bcrypt';
import Container, { Service } from 'typedi';
import httpStatus from 'http-status';
import { LoginUserDto, ResetPasswordUserDto, SignUpUserDto, UserKYCSetUpDto } from '../dtos/auth.dto';
import { HttpException } from '../utils/httpException';
import { sequelize, User, UserAccountMeta, UserLoginMeta, UserSession } from '../models';
import EmailService from './email.service';
import { TokenObj } from '../interfaces/auth.interface';
import _ from 'lodash';
import { UserSessionService } from './userSession.service';
import { TokenService } from './token.service';
import { TokenTypes } from '../types/auth.types';
import { SMSService } from './sms.service';
import { Op } from 'sequelize';
import { MonoService } from './mono.service';

@Service()
export class AuthService {
  public token = Container.get(TokenService);
  public email = Container.get(EmailService);
  public mono = Container.get(MonoService);
  public sms = Container.get(SMSService);
  public userSessionService = Container.get(UserSessionService);

  public async signUpUser(userData: SignUpUserDto): Promise<{
    token: string;
  }> {
    const transaction = await sequelize.transaction();
    try {
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email: userData?.email?.toLocaleLowerCase() }, { phoneNumber: userData?.phoneNumber }],
        },
      });

      if (existingUser) throw new HttpException(httpStatus.BAD_REQUEST, 'User already exists');

      const user = await User.create(
        {
          email: userData?.email,
          firstName: userData?.firstName,
          lastName: userData?.lastName,
          phoneNumber: userData?.phoneNumber,
          tally: await hash(userData?.password, 10),
        },
        { transaction },
      );

      await UserAccountMeta.create(
        {
          authType: 'EMAIL',
          isEmailVerified: false,
          ownerId: user.id,
          hasAgreedToTermsAndAgreements: true,
        },
        { transaction },
      );

      await UserLoginMeta.create(
        {
          lastLoginAt: new Date(),
          ownerId: user.id,
        },
        { transaction },
      );

      delete user.tally;

      const code = this.token.generateOtp();

      const token = await this.userSessionService.generateVerifyPhoneSessionToken(user, code);

      await transaction.commit();

      this.sms.sendVerificationCode(userData?.phoneNumber, code);

      return { token };
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      throw new HttpException(error?.status, error?.message);
    }
  }

  public async setKycForUser(userId: string, userData: UserKYCSetUpDto): Promise<any> {
    try {
      const user = await User.findOne({ where: { id: userId } });

      if (!user) throw new HttpException(httpStatus.NOT_FOUND, 'User not found');

      await user?.update({
        address: userData?.address,
        identityNumber: userData?.identityNumber,
        identityType: userData?.identityType,
      });

      await this.mono.createCustomer({
        email: user?.email,
        first_name: user?.firstName,
        last_name: user?.lastName,
        address: userData?.address,
        identity: {
          number: userData?.identityNumber,
          type: userData?.identityType,
        },
        phone: user?.phoneNumber,
        userId: user?.id,
      });

      return { user: (await User.findOne({ where: { id: userId } })).get({ plain: true }) };
    } catch (error) {
      throw new HttpException(error?.status, error?.message);
    }
  }

  public async loginUser(userData: LoginUserDto): Promise<{
    tokenData: {
      access: TokenObj;
      refresh: TokenObj;
    };
    user: User;
  }> {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: userData.userIdentifier?.toLocaleLowerCase() }, { phoneNumber: userData.userIdentifier }],
      },
    });

    if (!user) throw new HttpException(httpStatus.UNAUTHORIZED, 'User not found');

    const passwordMatched: boolean = await compare(userData.password, user.tally);

    if (!passwordMatched) throw new HttpException(httpStatus.UNAUTHORIZED, 'Incorrect password');

    await UserLoginMeta.update({ lastLoginAt: new Date() }, { where: { ownerId: user.id } });

    const userObj = user.toJSON();

    // Remove sensitive fields
    const safeUser = _.omit(userObj, ['tally']);

    const tokenData = await this.userSessionService.generateAuthSession(safeUser as User);

    return { tokenData, user: safeUser as User };
  }

  public async verifySMSOTPForUser(
    userId: string,
    _phone: string,
    otpCode: string,
  ): Promise<{
    token: string;
  }> {
    const tokenDoc = await UserSession.findOne({
      where: { userId: userId, phone: _phone, otp: otpCode, type: TokenTypes.VERIFY_PHONE },
    });

    console.log('STEP 1 complted');

    if (!tokenDoc) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

    console.log('STEP 2 complted');

    const verifiedToken = await this.userSessionService.verifySession(tokenDoc.token, TokenTypes.VERIFY_PHONE);

    console.log('STEP 3 complted');

    if (!verifiedToken) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

    console.log('STEP 4 complted');

    const { otp, phone } = verifiedToken;

    console.log(otp, 'otp');
    console.log(phone, 'phone');

    if (!otp || !phone) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');
    if (otp !== otpCode) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');
    if (phone !== _phone) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');
    if (verifiedToken.phone !== _phone) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

    const user = await User.findOne({ where: { id: userId } });

    if (!user) throw new HttpException(httpStatus.NOT_FOUND, 'User not found');

    await UserAccountMeta.update({ isPhoneVerified: true }, { where: { ownerId: user?.id } });

    await UserSession.destroy({ where: { userId: userId, phone: _phone, otp: otpCode, type: TokenTypes.VERIFY_PHONE } });

    const token = await this.userSessionService.generateSetKycSessionToken(user);

    return { token };
  }

  public async verifyEmailOTPForUser(userId: string, _email: string, otpCode: string): Promise<void> {
    const tokenDoc = await UserSession.findOne({
      where: { userId: userId, email: _email, otp: otpCode, type: TokenTypes.VERIFY_EMAIL },
    });

    if (!tokenDoc) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

    const verifiedToken = await this.userSessionService.verifySession(tokenDoc.token, TokenTypes.VERIFY_EMAIL);

    if (!verifiedToken) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

    const { otp, email } = verifiedToken;
    if (!otp || !email) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');
    if (otp !== otpCode) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');
    if (email !== _email) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');
    if (verifiedToken.email !== _email) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

    const user = await User.findOne({ where: { id: userId } });

    if (!user) throw new HttpException(httpStatus.NOT_FOUND, 'User not found');

    await UserAccountMeta.update({ isEmailVerified: true }, { where: { ownerId: user?.id } });

    await UserSession.destroy({ where: { userId: userId, email: _email, otp: otpCode, type: TokenTypes.VERIFY_EMAIL } });
  }

  public async verifyCodeForPasswordChangeForUser(userId: string, email: string, code: string): Promise<void> {
    try {
      const tokenDoc = await UserSession.findOne({
        where: { userId: userId, email, otp: code, type: TokenTypes.VERIFY_EMAIL },
      });

      if (!tokenDoc) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

      const verifiedToken = await this.userSessionService.verifySession(tokenDoc.token, TokenTypes.VERIFY_EMAIL);

      if (!verifiedToken) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

      const { otp, email: _email } = verifiedToken;
      if (!otp || !_email) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

      if (otp !== code) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

      if (_email !== email) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

      if (verifiedToken.email !== email) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

      await UserSession.destroy({ where: { userId: userId, email, type: TokenTypes.VERIFY_EMAIL, otp } });
    } catch (error) {
      throw new HttpException(error?.status, error?.message);
    }
  }

  public async resetUserPassword(userId: string, userData: ResetPasswordUserDto): Promise<void> {
    try {
      const session = await UserSession.findOne({
        where: { userId: userId, type: TokenTypes.RESET_PASSWORD },
      });

      if (!session) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid or expired token');

      if (userData.password !== userData.confirmedPassword) throw new HttpException(httpStatus.BAD_REQUEST, 'Passwords do not match');

      const user = await User.findOne({ where: { id: userId } });

      if (!user) throw new HttpException(httpStatus.NOT_FOUND, 'User not found');

      const hashedPassword = await hash(userData.password, 10);

      await User.update({ tally: hashedPassword }, { where: { id: userId } });

      await UserSession.destroy({ where: { userId: userId, type: TokenTypes.RESET_PASSWORD } });
    } catch (error) {
      throw new HttpException(error?.status, error?.message);
    }
  }

  public async verifyUserEmailOTP(userId: string, email: string, code: string): Promise<{ token: string }> {
    try {
      const tokenDoc = await UserSession.findOne({
        where: { userId: userId, email, otp: code, type: TokenTypes.VERIFY_EMAIL },
      });

      if (!tokenDoc) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

      const verifiedToken = await this.userSessionService.verifySession(tokenDoc.token, TokenTypes.VERIFY_EMAIL);

      if (!verifiedToken) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

      const { otp, email: _email } = verifiedToken;

      if (!otp || !_email) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

      if (otp !== code) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

      if (_email !== email) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

      if (verifiedToken.email !== email) throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid OTP');

      const user = await User.findOne({ where: { id: userId } });

      if (!user) throw new HttpException(httpStatus.NOT_FOUND, 'User not found');

      await UserAccountMeta.update({ isEmailVerified: true }, { where: { ownerId: user?.id } });

      await UserSession.destroy({ where: { userId: userId, email, otp, type: TokenTypes.VERIFY_EMAIL } });

      const token = await this.userSessionService.generateResetPasswordSessionToken(email);

      return { token };
    } catch (error) {
      throw new HttpException(error?.status, error?.message);
    }
  }
}
