import { HttpStatus } from "@nestjs/common"

export interface ISuccessResponse
{
  status: number
  data: any
  metadata?: any
}

export function SuccessResponse(input?: any, httpStatus: HttpStatus = HttpStatus.OK): ISuccessResponse
{
  if (!input) {
    return {
      status: httpStatus,
      data: []
    }
  }
  return getParsedResponse(input, httpStatus);
}

function getParsedResponse(input: any, httpStatus: HttpStatus): ISuccessResponse
{
  if (!(input instanceof Object)) {
    return {
      status: httpStatus,
      data: input
    }
  }
  if (input.hasOwnProperty('metadata') && input.hasOwnProperty('data')) {
    return {
      status: httpStatus,
      data: input.data,
      metadata: input.metadata
    }
  }
  return {
    status: httpStatus,
    data: input,
  } 
}

