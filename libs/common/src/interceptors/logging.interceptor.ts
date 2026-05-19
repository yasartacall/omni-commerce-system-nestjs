import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = req;
    const userAgent = req.get('user-agent') ?? '';
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse<Response>();
        const ms = Date.now() - start;
        this.logger.log({
          message: `${method} ${url}`,
          'http.request.method': method,
          'url.path': url,
          'http.response.status_code': res.statusCode,
          'event.duration': ms * 1_000_000,
          'client.ip': ip,
          'user_agent.original': userAgent,
        });
      }),
    );
  }
}
