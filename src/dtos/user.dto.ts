import { IsString, IsNotEmpty } from 'class-validator';

export class SetUserPhoneNumber {
  @IsString()
  @IsNotEmpty()
  public phoneNumber: string;
}
