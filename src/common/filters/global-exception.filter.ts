import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Log unhandled errors for debugging
    if (!(exception instanceof HttpException)) {
      console.error('❌ Unhandled exception:', exception);
    }

    const errorResponse = {
      success: false,
      error:
        exception instanceof HttpException
          ? exception.getResponse()
          : { message: 'Internal server error' },
    };

    response.status(status).json(errorResponse);
  }
}
