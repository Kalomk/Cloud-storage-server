import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthVaildateLogin {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
