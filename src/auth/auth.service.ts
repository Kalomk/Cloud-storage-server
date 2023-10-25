import { Injectable, ForbiddenException, Body } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthVaildateLogin } from './dto/AuthValidateLogin';
import { AuthVaildateSingUp } from './dto/AuthValidateSignUp';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signIn(@Body() dto: AuthVaildateLogin): Promise<any> {
    const user = await this.usersService.findByMail(dto.email);
    if (!user) {
      throw new ForbiddenException('Credential error (user not found)');
    }
    const pwMatches = await bcrypt.compare(dto.password, user.hash);

    if (!pwMatches) {
      throw new ForbiddenException('Credential error');
    }
    console.log('login');
    return (await this.signToken(user.id, user.email)).access_token;
  }

  async register(dto: AuthVaildateSingUp) {
    const saltAndRound = 10;
    const hash = await bcrypt.hash(dto.password, saltAndRound);
    try {
      const userData = await this.usersService.create({
        email: dto.email,
        hash: hash,
        fullName: dto.fullName,
      });

      return {
        token: (await this.signToken(userData.id, userData.email)).access_token,
      };
    } catch (err) {
      console.log(err);
      throw new ForbiddenException('Auth error');
    }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });
    return {
      access_token: token,
    };
  }
}
