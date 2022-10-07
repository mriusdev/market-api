import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { UserRegisterDTO } from "./dto";
import { UserLoginDTO } from "./dto";
import { JwtAuthAccessGuard, JwtAuthRefreshGuard } from "./guard";
import { IJwtTokens } from "./interfaces";

@Controller('auth')
export class AuthController{
  constructor(private authService: AuthService) {}
  
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: UserRegisterDTO): Promise<IJwtTokens> {
    console.log({
      dto
    });

    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: UserLoginDTO): Promise<IJwtTokens> {
    console.log({
      dto
    });
    
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthAccessGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request) {
    return this.authService.logout(req.user['id']);
  }

  @UseGuards(JwtAuthRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Req() req: Request) {
    return this.authService.refreshToken(req);
  }

}