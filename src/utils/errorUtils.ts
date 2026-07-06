
import type { AppError, AppErrorType } from '@/types';

export function isRetryableError(error: AppError): boolean {
  return error.retryable;
}

export function isNetworkError(error: AppError): boolean {
  return error.type === 'NETWORK_ERROR';
}

export function isNotFoundError(error: AppError): boolean {
  return error.type === 'NOT_FOUND';
}

const ERROR_MESSAGES: Record<AppErrorType, string> = {
  NETWORK_ERROR: 'No internet connection. Please check your network.',
  SERVICE_UNAVAILABLE: 'The server is temporarily unavailable.',
  NOT_FOUND: 'This item no longer exists.',
  BAD_REQUEST: 'Invalid request. Please try again.',
  SERVER_ERROR: 'Something went wrong on our end.',
  VALIDATION_ERROR: 'Received unexpected data from the server.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

export function getUserMessage(error: AppError): string {
  return ERROR_MESSAGES[error.type] ?? ERROR_MESSAGES.UNKNOWN_ERROR;
}

export function createAppError(
  type: AppErrorType,
  options?: {
    message?: string;
    statusCode?: number;
    originalError?: unknown;
  },
): AppError {
  const retryable =
    type === 'SERVICE_UNAVAILABLE' || type === 'NETWORK_ERROR';

  return {
    type,
    message: options?.message ?? ERROR_MESSAGES[type],
    retryable,
    statusCode: options?.statusCode,
    originalError: options?.originalError,
  };
}
