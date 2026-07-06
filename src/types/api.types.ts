export type AppErrorType =
  | 'NETWORK_ERROR' // timeout, no connection
  | 'SERVICE_UNAVAILABLE' // 503 — the API's random failure mode
  | 'NOT_FOUND' // 404
  | 'BAD_REQUEST' // 400
  | 'SERVER_ERROR' // 500
  | 'VALIDATION_ERROR' // Zod parse failure at API boundary
  | 'UNKNOWN_ERROR';

export type AppError = {
  type: AppErrorType;
  message: string;
  retryable: boolean;
  statusCode?: number;
  originalError?: unknown;
};

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };
