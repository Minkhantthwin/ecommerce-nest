import { ApiResponse, ResponseMeta } from '../interfaces/api-response.interface';

export class ResponseUtil {
  static success<T>(
    data: T,
    message: string = 'Request successful',
  ): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static successWithMeta<T>(
    data: T,
    meta: ResponseMeta,
    message: string = 'Request successful',
  ): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Request successful',
  ): ApiResponse<T[]> {
    return {
      success: true,
      message,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };
  }

  static created<T>(
    data: T,
    message: string = 'Resource created successfully',
  ): ApiResponse<T> {
    return this.success(data, message);
  }

  static updated<T>(
    data: T,
    message: string = 'Resource updated successfully',
  ): ApiResponse<T> {
    return this.success(data, message);
  }

  static deleted(
    message: string = 'Resource deleted successfully',
  ): ApiResponse<null> {
    return this.success(null, message);
  }
}