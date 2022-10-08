import { HttpStatus } from "@nestjs/common"
import { IGenericSuccessResponse } from "../../interfaces"

export const GenericSuccessResponse = (httpStatus: HttpStatus = HttpStatus.OK, message: string = 'Success', data?: any): IGenericSuccessResponse => {
  if (!data) {
    return {
      status: httpStatus,
      message,
    }
  }
  return {
    status: httpStatus,
    message,
    data
  }
}