import { IsEmail, IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class SignUpUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  public email: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  public firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  public lastName: string;

  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^233\d{9}$/, {
    message: 'Phone number must be in the format 233XXXXXXXXX (e.g., 233241489576)',
  })
  public phoneNumber: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*\d)/, {
    message: 'Password must contain at least one number',
  })
  @Matches(/(?=.*[!@#$%^&*()\-_=+{};:,<.>])/, { message: 'Password must contain at least one special character' })
  public password: string;
}

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  public userIdentifier: string;

  @IsString()
  @IsNotEmpty()
  public password: string;
}

export class VerifyUserEmailDto {
  @IsString()
  @IsNotEmpty()
  public code: string;
}

export class RequestUserEmailOtpDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;
}

export class ResetPasswordUserDto {
  @IsString()
  @IsNotEmpty()
  public password: string;

  @IsString()
  @IsNotEmpty()
  public confirmedPassword: string;
}

export class UserKYCSetUpDto {
  @IsString()
  @IsNotEmpty()
  public address: string;

  @IsString()
  @IsNotEmpty()
  public identityNumber: string;

  @IsString()
  @IsNotEmpty()
  public identityType: string;
}
