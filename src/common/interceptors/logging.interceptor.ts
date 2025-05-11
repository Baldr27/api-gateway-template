import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params, headers } = request;
    const userAgent = headers['user-agent'];
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const responseTime = Date.now() - startTime;

          this.logger.log(
            `${method} ${url} ${statusCode} ${responseTime}ms - ${userAgent}`,
          );

          if (process.env.NODE_ENV === 'development') {
            this.logger.debug('Request:', {
              method,
              url,
              body,
              query,
              params,
              headers,
            });
            this.logger.debug('Response:', {
              statusCode,
              data,
              responseTime,
            });
          }
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.logger.error(
            `${method} ${url} ${error.status || 500} ${responseTime}ms - ${userAgent}`,
            error.stack,
          );
        },
      }),
    );
  }
} 