import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  import { ApiResponse } from '../interfaces/api-response.interface';
  
  @Injectable()
  export class TransformInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T>>
  {
    intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Observable<ApiResponse<T>> {
      return next.handle().pipe(
        map((data) => {
          // If data is already in our response format, return as is
          if (data && typeof data === 'object' && 'success' in data) {
            return data;
          }
  
          // Transform to standard format
          return {
            success: true,
            message: data?.message || 'Request successful',
            data: this.extractData(data),
            timestamp: new Date().toISOString(),
          };
        }),
      );
    }
  
    private extractData(data: any): any {
      if (!data) return null;
  
      // If data has a 'data' property, use it
      if (data.data !== undefined) {
        return data.data;
      }
  
      // If data has a 'message' property but no data, return null
      if (data.message && Object.keys(data).length === 1) {
        return null;
      }
  
      // Remove message from data if present
      const { message, ...rest } = data;
      return Object.keys(rest).length > 0 ? rest : data;
    }
  }