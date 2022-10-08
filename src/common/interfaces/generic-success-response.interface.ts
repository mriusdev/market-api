import { HttpStatus } from "@nestjs/common";

export interface IGenericSuccessResponse {
  status:  HttpStatus
  message: string
  data?:   any
}