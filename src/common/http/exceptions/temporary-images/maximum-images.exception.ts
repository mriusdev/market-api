import { HttpException, HttpStatus } from "@nestjs/common";

export class MaximumImagesException extends HttpException
{
  constructor() {
    super('Maximum images count reached', HttpStatus.TOO_MANY_REQUESTS);
  }
}
