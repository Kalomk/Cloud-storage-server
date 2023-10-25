import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { AuthVaildateLogin } from './dto/AuthValidateLogin';
import { AuthVaildateSingUp } from './dto/AuthValidateSignUp';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  @ApiBody({ type: CreateUserDto })
  async login(@Body() dto: AuthVaildateLogin) {
    return this.authService.signIn(dto);
  }
  @Post('/signup')
  async register(@Body() dto: AuthVaildateSingUp) {
    return this.authService.register(dto);
  }
}
