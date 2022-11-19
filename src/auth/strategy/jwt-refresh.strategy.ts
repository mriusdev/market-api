import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let refreshToken = request?.cookies.rt
          if (!refreshToken) {
            return null
          }
          return refreshToken
        }
      ]),
      secretOrKey: config.get('JWT_REFRESH_SECRET_KEY'),
      passReqToCallback: true
    })
  }

  validate(req: Request, payload: any) {
    const refreshToken = req.cookies.rt;

    return {
      ...payload,
      refreshToken
    };
  }
}
