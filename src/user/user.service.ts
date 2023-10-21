import { Injectable, NotFoundException } from '@nestjs/common';
import { NotFoundError } from '@prisma/client/runtime';
import { GenericException } from '../common/http/exceptions/generic.exception';
import { GenericSuccessResponse } from '../common/helpers/responses';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getUser(username: string) {
    console.log(username);
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          username
        },
        select: {
          username: true,
          name: true
        }
      })
      return GenericSuccessResponse(undefined, undefined, user)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException()
      }
      throw new GenericException();
    }
  }
}
