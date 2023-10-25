import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JWTGuard } from 'src/auth/guard';
import { UserId } from 'src/decorators/user-id.decorator';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JWTGuard)
  async getMe(@UserId() id: number) {
    console.log('user find!');
    return this.usersService.findById(id);
  }
}
