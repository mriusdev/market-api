import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserRegisterDTO } from "./dto";
import * as argon2 from 'argon2'; 
import { UserLoginDTO } from "./dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { IJwtTokens } from "./interfaces";
import { Request } from "express";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}
  async register(dto: UserRegisterDTO): Promise<IJwtTokens> {
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
  
      return this.signTokens(user.id, user.email);
      
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Make sure the email and username fields are unique')
        }
      }
      throw error;
    }
  }

  async login(dto: UserLoginDTO): Promise<IJwtTokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    })

    if (!user) {
      throw new UnauthorizedException('Could not identify')
    }

    const verifyHash = await argon2.verify(user.passwordHash, dto.password);

    if (!verifyHash) {
      throw new UnauthorizedException('Incorrect credentials')
    }

    // const tokens = await this.signTokens(user.id, user.email);

    // await this.updateRefreshToken(user.id, tokens.refresh_token);

    return this.signTokens(user.id, user.email);
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

  async logout(userId: number) {
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
  }

  async refreshToken(req: Request) {
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
      this.logout(req.user['sub']);
      throw new UnauthorizedException('Could not verify user details')
    }
    
    return this.signTokens(req.user['sub'], req.user['email']);
  }

  async signTokens(userId: number, email: string): Promise<IJwtTokens> {
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
        expiresIn: '30m',
        secret: this.config.get('JWT_REFRESH_SECRET_KEY')
      }),
    ])

    await this.updateRefreshToken(userId, refresh_token);

    return {
      access_token,
      refresh_token
    }
  }
}