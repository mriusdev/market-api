import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserRegisterDTO } from "./dto";
import * as argon2 from 'argon2'; 
import { UserLoginDTO } from "./dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { IJwtTokens } from "./interfaces";
import { Request, Response } from "express";
import { GenericException } from "../common/helpers/exceptions";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}
  async register(dto: UserRegisterDTO, res: Response): Promise<IJwtTokens> {
    const hash = await argon2.hash(dto.password)
    try {
      const user = await this.prisma.user.create({
        data: {
          username: dto.username,
          email: dto.email,
          name: dto.name,
          passwordHash: hash
        },
        select: {
          id: true,
          username: true,
          email: true,
          name: true
        }
      })
  
      return this.signTokens(user.id, user.email, res);
      
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Make sure the email and username fields are unique')
        }
      }
      throw new GenericException()
    }
  }

  async login(dto: UserLoginDTO, res: Response): Promise<IJwtTokens> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email
        }
      })
      if (!user) {
        throw new UnauthorizedException('Incorrect credentials')
      }
  
      const verifyHash = await argon2.verify(user.passwordHash, dto.password);
  
      if (!verifyHash) {
        throw new UnauthorizedException('Incorrect credentials')
      }
  
      return this.signTokens(user.id, user.email, res);
      
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new GenericException()
    }

  }

  async updateRefreshToken(userId: number, refreshToken: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        refreshTokenHash: await argon2.hash(refreshToken)
      }
    });
  }

  async logout(userId: number, res: Response) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        NOT: {
          refreshTokenHash: null
        }
      },
      data: {
        refreshTokenHash: null
      }
    })
    res.clearCookie('rt', { httpOnly: true, domain: this.config.get('FRONTEND_DOMAIN')})
  }

  async refreshToken(req: Request, res: Response) {
    const {refreshTokenHash} = await this.prisma.user.findUnique({
      where: {
        id: req.user['sub']
      },
      select: {
        refreshTokenHash: true
      }
    })
    
    const verifyRefreshHash = await argon2.verify(refreshTokenHash, req.user['refreshToken'])

    if (!verifyRefreshHash) {
      this.logout(req.user['sub'], res);
      throw new UnauthorizedException('Could not verify user details')
    }
    
    return this.signTokens(req.user['sub'], req.user['email'], res);
  }

  async signTokens(userId: number, email: string, res: Response): Promise<IJwtTokens> {
    const payload = {
      sub: userId,
      email
    }

    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: '5m',
        secret: this.config.get('JWT_SECRET_KEY')
      }),
      this.jwt.signAsync(payload, {
        expiresIn: '10m',
        secret: this.config.get('JWT_REFRESH_SECRET_KEY')
      }),
    ])

    await this.updateRefreshToken(userId, refresh_token);
    res.cookie('rt', refresh_token, { httpOnly: true, domain: this.config.get('FRONTEND_DOMAIN')})

    return {
      access_token
    }
  }
}
