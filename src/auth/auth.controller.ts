import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserRegisterDTO } from "./dto";
import { UserLoginDTO } from "./dto";

@Controller('auth')
export class AuthController{
  constructor(private authService: AuthService) {}
  @Post('register')
  register(@Body() dto: UserRegisterDTO) {
    console.log({
      dto
    });

    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: UserLoginDTO) {
    console.log({
      dto
    });
    
    return this.authService.login(dto);
  }

}