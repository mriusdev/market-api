import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserRegisterDTO } from "./dto";
import * as argon2 from 'argon2'; 
import { UserLoginDTO } from "./dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { IJwtAccessToken } from "./interfaces";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}
  async register(dto: UserRegisterDTO): Promise<IJwtAccessToken> {
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
  
      return this.signToken(user.id, user.email);
      
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Make sure the email and username fields are unique')
        }
      }
      throw error;
    }
  }

  async login(dto: UserLoginDTO): Promise<IJwtAccessToken> {
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
      throw new UnauthorizedException('Could not identify')
    }

    return this.signToken(user.id, user.email);
  }

  async signToken(userId: number, email: string): Promise<IJwtAccessToken> {
    const payload = {
      sub: userId,
      email
    }

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '5m',
      secret: this.config.get('JWT_SECRET_KEY')
    })

    return {
      access_token: token
    }
  }
}