import { IsString, IsNotEmpty } from 'class-validator';

export class SendChatDto {
  @IsString()
  @IsNotEmpty()
  public message: string;
}
