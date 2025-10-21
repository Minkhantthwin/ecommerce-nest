import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Prisma } from '@prisma/client';
  import { Response } from 'express';
  import { ErrorResponse } from '../interfaces/api-response.interface';
  
  @Catch(Prisma.PrismaClientKnownRequestError)
  export class PrismaExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(PrismaExceptionFilter.name);
  
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Database error occurred';
  
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = `Unique constraint failed on ${this.getFieldName(exception)}`;
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed';
          break;
        case 'P2014':
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid relation';
          break;
        default:
          this.logger.error(`Unhandled Prisma error code: ${exception.code}`);
      }
  
      const errorResponse: ErrorResponse = {
        success: false,
        message,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
  
      response.status(status).json(errorResponse);
    }
  
    private getFieldName(exception: Prisma.PrismaClientKnownRequestError): string {
      if (exception.meta?.target) {
        return Array.isArray(exception.meta.target)
          ? exception.meta.target.join(', ')
          : String(exception.meta.target);
      }
      return 'field';
    }
  }