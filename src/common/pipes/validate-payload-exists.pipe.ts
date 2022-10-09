import { BadRequestException, PipeTransform } from "@nestjs/common";

export class ValidatePayloadExistsPipe implements PipeTransform {
  transform(value: any): any {
    console.log(value);
    if (!Object.keys(value).length) {
      throw new BadRequestException('Payload should not be empty');
    }

    return value;
  }
}