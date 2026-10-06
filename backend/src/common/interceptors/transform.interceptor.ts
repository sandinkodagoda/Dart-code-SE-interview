import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        // If the response is null or undefined
        if (res === null || res === undefined) {
          return {
            success: true,
            data: null as unknown as T,
          };
        }

        // If response already contains explicit 'success' and 'data' structure
        if (typeof res === 'object' && 'success' in res && 'data' in res) {
          return res;
        }

        // If response is a paginated object { data, pagination, message? }
        if (typeof res === 'object' && 'data' in res && 'pagination' in res) {
          return {
            success: true,
            message: res.message || 'Data retrieved successfully',
            data: res.data,
            pagination: res.pagination,
          };
        }

        // Standard object or primitive return
        return {
          success: true,
          message:
            typeof res === 'object' && res.message ? res.message : undefined,
          data:
            typeof res === 'object' && res.message && Object.keys(res).length === 1
              ? (null as unknown as T)
              : res,
        };
      }),
    );
  }
}
