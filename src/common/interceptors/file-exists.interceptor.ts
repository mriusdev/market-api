import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";

export class FileExistsInterceptor implements NestInterceptor
{
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>>
  {
    console.log('before route handler');
  
    if (true) {
      throw new Error('File not found');
    }

    return next.handle();
  }
}
