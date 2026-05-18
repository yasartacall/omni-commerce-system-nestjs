import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | undefined>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T> | undefined> {
    // Kafka / RPC handler'larına uygulanmaz
    if (context.getType() !== 'http') {
      return next.handle() as Observable<ApiResponse<T> | undefined>;
    }

    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // 204 No Content — body ekleme
        if (data === undefined || data === null) {
          return undefined;
        }

        return {
          data,
          statusCode: res.statusCode,
          message: 'Success',
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
