import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  import { ErrorResponse, ErrorDetail } from '../interfaces/api-response.interface';
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);
  
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';
      let errors: ErrorDetail[] | undefined;
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
  
        if (typeof exceptionResponse === 'string') {
          message = exceptionResponse;
        } else if (typeof exceptionResponse === 'object') {
          const response = exceptionResponse as any;
          message = response.message || response.error || message;
  
          // Handle validation errors
          if (Array.isArray(response.message)) {
            errors = response.message.map((msg: string) => ({
              message: msg,
            }));
            message = 'Validation failed';
          }
        }
      } else if (exception instanceof Error) {
        message = exception.message;
        this.logger.error(
          `Unhandled exception: ${exception.message}`,
          exception.stack,
        );
      }
  
      const errorResponse: ErrorResponse = {
        success: false,
        message,
        errors,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
  
      // Log error for server errors
      if (status >= 500) {
        this.logger.error(
          `${request.method} ${request.url} - Status: ${status}`,
          exception,
        );
      }
  
      response.status(status).json(errorResponse);
    }
  }