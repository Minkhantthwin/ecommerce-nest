export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    meta?: ResponseMeta;
    timestamp: string;
  }
  
  export interface ResponseMeta {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  }
  
  export interface ErrorResponse {
    success: false;
    message: string;
    errors?: ErrorDetail[];
    statusCode: number;
    timestamp: string;
    path?: string;
  }
  
  export interface ErrorDetail {
    field?: string;
    message: string;
    code?: string;
  }