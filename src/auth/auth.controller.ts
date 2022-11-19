import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
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
  register(@Body() dto: UserRegisterDTO, @Res({passthrough: true}) res: Response): Promise<IJwtTokens> {
    return this.authService.register(dto, res);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: UserLoginDTO, @Res({passthrough: true}) res: Response): Promise<IJwtTokens> {
    return this.authService.login(dto, res);
  }

  @UseGuards(JwtAuthAccessGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    return this.authService.logout(req.user['id'], res);
  }

  @UseGuards(JwtAuthRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    return this.authService.refreshToken(req, res);
  }

}
