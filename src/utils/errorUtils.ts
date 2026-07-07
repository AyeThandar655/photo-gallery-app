import axios from 'axios';
import { ZodError } from 'zod';
import type { AppError, AppErrorType } from '@/types';

const ERROR_MESSAGES: Record<AppErrorType, string> = {
  NETWORK_ERROR: 'No internet connection. Please check your network.',
  SERVICE_UNAVAILABLE: 'The server is temporarily unavailable.',
  NOT_FOUND: 'This item no longer exists.',
  BAD_REQUEST: 'Invalid request. Please try again.',
  SERVER_ERROR: 'Something went wrong on our end.',
  VALIDATION_ERROR: 'Received unexpected data from the server.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

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
    message: options?.message ?? ERROR_MESSAGES[type] ?? ERROR_MESSAGES.UNKNOWN_ERROR,
    retryable,
    statusCode: options?.statusCode,
    originalError: options?.originalError,
  };
}

export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'retryable' in error &&
    'message' in error &&
    typeof (error as Record<string, unknown>).type === 'string' &&
    typeof (error as Record<string, unknown>).retryable === 'boolean'
  );
}

export function isRetryableError(error: AppError): boolean {
  return error.retryable;
}

export function isNetworkError(error: AppError): boolean {
  return error.type === 'NETWORK_ERROR';
}

export function isNotFoundError(error: AppError): boolean {
  return error.type === 'NOT_FOUND';
}

export function getUserMessage(error: AppError): string {
  return ERROR_MESSAGES[error.type] ?? ERROR_MESSAGES.UNKNOWN_ERROR;
}

export function normalizeAxiosError(error: unknown): AppError {
  if (!axios.isAxiosError(error)) {
    return createAppError('UNKNOWN_ERROR', { originalError: error });
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return createAppError('NETWORK_ERROR', {
      message: 'Request timed out.',
      originalError: error,
    });
  }

  if (error.response === undefined) {
    return createAppError('NETWORK_ERROR', {
      message: error.message,
      originalError: error,
    });
  }

  const { status } = error.response;

  switch (status) {
    case 503:
      return createAppError('SERVICE_UNAVAILABLE', {
        statusCode: 503,
        originalError: error,
      });

    case 404:
      return createAppError('NOT_FOUND', {
        statusCode: 404,
        originalError: error,
      });

    case 400:
    case 422:
      return createAppError('BAD_REQUEST', {
        statusCode: status,
        originalError: error,
      });

    case 401:
    case 403:
      return createAppError('UNKNOWN_ERROR', {
        statusCode: status,
        originalError: error,
      });

    case 429:
      return createAppError('SERVICE_UNAVAILABLE', {
        statusCode: 429,
        originalError: error,
      });

    case 500:
    case 502:
    case 504:
      return createAppError('SERVER_ERROR', {
        statusCode: status,
        originalError: error,
      });

    default:
      return createAppError('UNKNOWN_ERROR', {
        statusCode: status,
        originalError: error,
      });
  }
}

export function normalizeError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    return normalizeAxiosError(error);
  }

  // ZodError: schema validation failed on an API response.
  if (error instanceof ZodError) {
    const fieldSummary = error.issues
      .slice(0, 3)
      .map(i => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    return createAppError('VALIDATION_ERROR', {
      message: `Received unexpected data from the server${fieldSummary ? ` (${fieldSummary})` : ''}.`,
      originalError: error,
    });
  }

  return createAppError('UNKNOWN_ERROR', { originalError: error });
}
