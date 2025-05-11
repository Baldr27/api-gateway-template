import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
      error = (exceptionResponse as any).error || exception.name;
      details = (exceptionResponse as any).details || null;
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database operation failed';
      error = 'Database Error';
      details = exception.message;

      // Handle unique constraint violations
      if (exception.message.includes('duplicate key')) {
        message = 'Resource already exists';
        error = 'Conflict';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      details = exception.stack;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
      ...(details && { details }),
    };

    this.logger.error(
      `${request.method} ${request.url} ${status}`,
      exception instanceof Error ? exception.stack : null,
      'AllExceptionsFilter',
    );

    if (process.env.NODE_ENV === 'development') {
      this.logger.debug('Request:', {
        headers: request.headers,
        query: request.query,
        body: request.body,
        params: request.params,
      });
    }

    response.status(status).json(errorResponse);
  }
} 