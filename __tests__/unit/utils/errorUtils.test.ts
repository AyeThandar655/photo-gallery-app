import { AxiosError, AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { z } from 'zod';
import {
  createAppError,
  getUserMessage,
  isAppError,
  isNetworkError,
  isNotFoundError,
  isRetryableError,
  normalizeAxiosError,
  normalizeError,
} from '@/utils';
import type { AppError, AppErrorType } from '@/types';

function makeConfig(): InternalAxiosRequestConfig {
  return { headers: new AxiosHeaders() };
}

function makeHttpError(status: number): AxiosError {
  const response: AxiosResponse = {
    status,
    statusText: 'Error',
    data: { error: 'Simulated failure' },
    headers: {},
    config: makeConfig(),
  };
  return new AxiosError('HTTP Error', 'ERR_BAD_RESPONSE', makeConfig(), null, response);
}

function makeNetworkError(code: string): AxiosError {
  return new AxiosError('Network Error', code, makeConfig(), null, undefined);
}

describe('createAppError', () => {
  it('sets retryable: true for SERVICE_UNAVAILABLE', () => {
    const error = createAppError('SERVICE_UNAVAILABLE');
    expect(error.retryable).toBe(true);
  });

  it('sets retryable: true for NETWORK_ERROR', () => {
    const error = createAppError('NETWORK_ERROR');
    expect(error.retryable).toBe(true);
  });

  it.each<AppErrorType>([
    'NOT_FOUND',
    'BAD_REQUEST',
    'SERVER_ERROR',
    'VALIDATION_ERROR',
    'UNKNOWN_ERROR',
  ])('sets retryable: false for %s', type => {
    const error = createAppError(type);
    expect(error.retryable).toBe(false);
  });

  it('uses the provided message when given', () => {
    const error = createAppError('SERVER_ERROR', { message: 'Custom message' });
    expect(error.message).toBe('Custom message');
  });

  it('falls back to the default message when none is given', () => {
    const error = createAppError('NOT_FOUND');
    expect(error.message).toBeTruthy();
    expect(typeof error.message).toBe('string');
  });

  it('attaches the statusCode when provided', () => {
    const error = createAppError('SERVER_ERROR', { statusCode: 500 });
    expect(error.statusCode).toBe(500);
  });

  it('statusCode is undefined when not provided', () => {
    const error = createAppError('UNKNOWN_ERROR');
    expect(error.statusCode).toBeUndefined();
  });

  it('attaches originalError when provided', () => {
    const original = new Error('raw');
    const error = createAppError('UNKNOWN_ERROR', { originalError: original });
    expect(error.originalError).toBe(original);
  });
});

describe('normalizeAxiosError', () => {
  it('maps 503 → SERVICE_UNAVAILABLE with retryable: true', () => {
    const error = normalizeAxiosError(makeHttpError(503));
    expect(error.type).toBe('SERVICE_UNAVAILABLE');
    expect(error.retryable).toBe(true);
    expect(error.statusCode).toBe(503);
  });

  it('maps 404 → NOT_FOUND with retryable: false', () => {
    const error = normalizeAxiosError(makeHttpError(404));
    expect(error.type).toBe('NOT_FOUND');
    expect(error.retryable).toBe(false);
    expect(error.statusCode).toBe(404);
  });

  it('maps 400 → BAD_REQUEST with retryable: false', () => {
    const error = normalizeAxiosError(makeHttpError(400));
    expect(error.type).toBe('BAD_REQUEST');
    expect(error.retryable).toBe(false);
  });

  it('maps 422 → BAD_REQUEST with retryable: false', () => {
    const error = normalizeAxiosError(makeHttpError(422));
    expect(error.type).toBe('BAD_REQUEST');
    expect(error.retryable).toBe(false);
    expect(error.statusCode).toBe(422);
  });

  it('maps 429 → SERVICE_UNAVAILABLE with retryable: true', () => {
    const error = normalizeAxiosError(makeHttpError(429));
    expect(error.type).toBe('SERVICE_UNAVAILABLE');
    expect(error.retryable).toBe(true);
    expect(error.statusCode).toBe(429);
  });

  it.each([500, 502, 504])('maps %d → SERVER_ERROR with retryable: false', status => {
    const error = normalizeAxiosError(makeHttpError(status));
    expect(error.type).toBe('SERVER_ERROR');
    expect(error.retryable).toBe(false);
    expect(error.statusCode).toBe(status);
  });

  it('maps unexpected status → UNKNOWN_ERROR', () => {
    const error = normalizeAxiosError(makeHttpError(418));
    expect(error.type).toBe('UNKNOWN_ERROR');
    expect(error.retryable).toBe(false);
  });

  it('maps ECONNABORTED (timeout) → NETWORK_ERROR with retryable: true', () => {
    const error = normalizeAxiosError(makeNetworkError('ECONNABORTED'));
    expect(error.type).toBe('NETWORK_ERROR');
    expect(error.retryable).toBe(true);
  });

  it('maps ETIMEDOUT → NETWORK_ERROR with retryable: true', () => {
    const error = normalizeAxiosError(makeNetworkError('ETIMEDOUT'));
    expect(error.type).toBe('NETWORK_ERROR');
    expect(error.retryable).toBe(true);
  });

  it('maps network error with no response → NETWORK_ERROR with retryable: true', () => {
    const error = normalizeAxiosError(makeNetworkError('ERR_NETWORK'));
    expect(error.type).toBe('NETWORK_ERROR');
    expect(error.retryable).toBe(true);
  });

  it('maps a plain Error (non-Axios) → UNKNOWN_ERROR with retryable: false', () => {
    const error = normalizeAxiosError(new Error('unexpected'));
    expect(error.type).toBe('UNKNOWN_ERROR');
    expect(error.retryable).toBe(false);
  });

  it('maps a plain string → UNKNOWN_ERROR', () => {
    const error = normalizeAxiosError('something went wrong');
    expect(error.type).toBe('UNKNOWN_ERROR');
  });

  it('preserves the original error on the AppError', () => {
    const axiosError = makeHttpError(503);
    const error = normalizeAxiosError(axiosError);
    expect(error.originalError).toBe(axiosError);
  });
});

describe('normalizeError', () => {
  it('passes through an already-normalised AppError without re-wrapping', () => {
    const original = createAppError('NOT_FOUND');
    const result = normalizeError(original);
    expect(result).toBe(original); 
  });

  it('delegates AxiosError to normalizeAxiosError', () => {
    const axiosError = makeHttpError(503);
    const result = normalizeError(axiosError);
    expect(result.type).toBe('SERVICE_UNAVAILABLE');
  });

  it('maps an unknown error → UNKNOWN_ERROR', () => {
    const result = normalizeError(new TypeError('type error'));
    expect(result.type).toBe('UNKNOWN_ERROR');
    expect(result.retryable).toBe(false);
  });

  it('maps null → UNKNOWN_ERROR', () => {
    const result = normalizeError(null);
    expect(result.type).toBe('UNKNOWN_ERROR');
  });

  it('maps a ZodError → VALIDATION_ERROR with retryable: false', () => {
    const zodError = z.object({ id: z.string() }).safeParse(null);
    expect(zodError.success).toBe(false);
    if (!zodError.success) {
      const result = normalizeError(zodError.error);
      expect(result.type).toBe('VALIDATION_ERROR');
      expect(result.retryable).toBe(false);
    }
  });

  it('ZodError message includes field context', () => {
    const zodError = z.object({ id: z.string() }).safeParse({});
    expect(zodError.success).toBe(false);
    if (!zodError.success) {
      const result = normalizeError(zodError.error);
      // Message should mention the field path
      expect(result.message).toMatch(/id/);
    }
  });

  it('preserves ZodError as originalError', () => {
    const zodError = z.string().safeParse(null);
    expect(zodError.success).toBe(false);
    if (!zodError.success) {
      const result = normalizeError(zodError.error);
      expect(result.originalError).toBe(zodError.error);
    }
  });
});

describe('isAppError', () => {
  it('returns true for a valid AppError', () => {
    const error: AppError = createAppError('NOT_FOUND');
    expect(isAppError(error)).toBe(true);
  });

  it('returns false for a plain Error instance', () => {
    expect(isAppError(new Error('plain'))).toBe(false);
  });

  it('returns false for null', () => {
    expect(isAppError(null)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isAppError('error string')).toBe(false);
  });

  it('returns false for an object missing required fields', () => {
    expect(isAppError({ type: 'NOT_FOUND' })).toBe(false); 
  });
});

describe('isRetryableError', () => {
  it('returns true when retryable is true', () => {
    expect(isRetryableError(createAppError('SERVICE_UNAVAILABLE'))).toBe(true);
    expect(isRetryableError(createAppError('NETWORK_ERROR'))).toBe(true);
  });

  it('returns false when retryable is false', () => {
    expect(isRetryableError(createAppError('NOT_FOUND'))).toBe(false);
    expect(isRetryableError(createAppError('BAD_REQUEST'))).toBe(false);
  });
});

describe('isNetworkError', () => {
  it('returns true for NETWORK_ERROR type', () => {
    expect(isNetworkError(createAppError('NETWORK_ERROR'))).toBe(true);
  });

  it('returns false for any other type', () => {
    expect(isNetworkError(createAppError('SERVICE_UNAVAILABLE'))).toBe(false);
  });
});

describe('isNotFoundError', () => {
  it('returns true for NOT_FOUND type', () => {
    expect(isNotFoundError(createAppError('NOT_FOUND'))).toBe(true);
  });

  it('returns false for any other type', () => {
    expect(isNotFoundError(createAppError('SERVER_ERROR'))).toBe(false);
  });
});

describe('getUserMessage', () => {
  it('returns a non-empty string for every AppErrorType', () => {
    const allTypes: AppErrorType[] = [
      'NETWORK_ERROR',
      'SERVICE_UNAVAILABLE',
      'NOT_FOUND',
      'BAD_REQUEST',
      'SERVER_ERROR',
      'VALIDATION_ERROR',
      'UNKNOWN_ERROR',
    ];

    for (const type of allTypes) {
      const message = getUserMessage(createAppError(type));
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    }
  });

  it('returns a user-friendly string, not a raw error code', () => {
    const message = getUserMessage(createAppError('SERVICE_UNAVAILABLE'));
    expect(message).not.toContain('SERVICE_UNAVAILABLE');
    expect(message).not.toContain('503');
  });
});
