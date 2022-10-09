import { Controller, Get, HttpCode, HttpStatus, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthAccessGuard } from '../auth/guard';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  getMe(@Req() req: Request) {
    return req.user;
  }

  @HttpCode(HttpStatus.OK)
  @Get(':username')
  getUser(@Param('username') username: string) {
    console.log(username);
    return this.userService.getUser(username)
  }
}
