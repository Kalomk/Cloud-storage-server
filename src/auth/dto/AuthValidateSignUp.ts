import { IsNotEmpty, IsString } from 'class-validator';
import { AuthVaildateLogin } from './AuthValidateLogin';

export class AuthVaildateSingUp extends AuthVaildateLogin {
  @IsString()
  @IsNotEmpty()
  fullName: string;
}
