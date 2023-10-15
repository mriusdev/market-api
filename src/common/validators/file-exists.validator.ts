import { ArgumentMetadata, FileTypeValidatorOptions, FileValidator, PipeTransform } from "@nestjs/common";

// export interface CustomUploadTypeValidatorOptions {
//   fileType: string[];
// }

export class FileExistsValidator extends FileValidator
{
  constructor() {
    super({});
  }

  isValid(file?: any): boolean | Promise<boolean> {
    return !!file;
  }

  buildErrorMessage(file: any): string {
    return "Could not find any attached files";
  }
}
