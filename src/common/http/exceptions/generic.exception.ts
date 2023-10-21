import { HttpException, HttpStatus } from "@nestjs/common";

export class GenericException extends HttpException {
  constructor(message: string = 'Oops! Something went wrong', httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message, httpStatus)
  }
}
