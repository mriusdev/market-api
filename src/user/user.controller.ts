import { Controller, Get, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthAccessGuard } from '../auth/guard';

@Controller('users')
export class UserController {
  
  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  getMe(@Req() req: Request) {
    return req.user;
  }
}
