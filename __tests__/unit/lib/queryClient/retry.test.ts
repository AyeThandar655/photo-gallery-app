import {
  MAX_RETRY_COUNT,
  RETRY_BASE_DELAY_MS,
  RETRY_MAX_DELAY_MS,
  RETRY_JITTER_FACTOR,
} from '@/constants';
import { createAppError } from '@/utils';
import { smartRetry, retryDelay } from '@/lib/queryClient/retry';
import type { AppErrorType } from '@/types';

describe('smartRetry', () => {
  // Retryable error types
  it.each<AppErrorType>(['NETWORK_ERROR', 'SERVICE_UNAVAILABLE'])(
    'returns true for retryable type %s when under the cap',
    type => {
      const error = createAppError(type);
      expect(smartRetry(0, error)).toBe(true);
    },
  );

  // Non-retryable error types — should stop immediately
  it.each<AppErrorType>([
    'NOT_FOUND',
    'BAD_REQUEST',
    'SERVER_ERROR',
    'VALIDATION_ERROR',
    'UNKNOWN_ERROR',
  ])('returns false for non-retryable type %s regardless of attempt count', type => {
    const error = createAppError(type);
    expect(smartRetry(0, error)).toBe(false);
    expect(smartRetry(2, error)).toBe(false);
  });

  it(`returns false once failureCount reaches MAX_RETRY_COUNT (${MAX_RETRY_COUNT})`, () => {
    const retryableError = createAppError('SERVICE_UNAVAILABLE');
    expect(smartRetry(MAX_RETRY_COUNT, retryableError)).toBe(false);
  });

  it('returns true for attempts below the cap with a retryable error', () => {
    const error = createAppError('NETWORK_ERROR');
    for (let i = 0; i < MAX_RETRY_COUNT; i++) {
      expect(smartRetry(i, error)).toBe(true);
    }
  });

  it('returns true for an unknown error shape below the cap (defensive)', () => {
    expect(smartRetry(0, new Error('raw'))).toBe(true);
    expect(smartRetry(0, 'string error')).toBe(true);
    expect(smartRetry(0, null)).toBe(true);
  });

  it('returns false for an unknown error shape at the cap', () => {
    expect(smartRetry(MAX_RETRY_COUNT, new Error('raw'))).toBe(false);
  });

  it('never retries a 404 — deterministic, no point retrying', () => {
    const notFound = createAppError('NOT_FOUND', { statusCode: 404 });
    // Even on first failure (failureCount: 0) it should stop.
    expect(smartRetry(0, notFound)).toBe(false);
  });
});

// ─── retryDelay ───────────────────────────────────────────────────────────────

describe('retryDelay', () => {
  // Seed Math.random for deterministic jitter checks.
  const originalRandom = Math.random;
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('returns a number (ms)', () => {
    expect(typeof retryDelay(1)).toBe('number');
  });

  it('returns a non-negative delay', () => {
    for (let attempt = 1; attempt <= MAX_RETRY_COUNT; attempt++) {
      expect(retryDelay(attempt)).toBeGreaterThanOrEqual(0);
    }
  });

  it('never exceeds RETRY_MAX_DELAY_MS', () => {
    // Try many random seeds to exercise jitter range.
    for (let attempt = 1; attempt <= 10; attempt++) {
      expect(retryDelay(attempt)).toBeLessThanOrEqual(RETRY_MAX_DELAY_MS);
    }
  });

  it('delay grows with attempt count (deterministic with random = 1)', () => {
    // With Math.random = 1 (max jitter), delay equals the capped exponential value.
    Math.random = () => 1;
    const d1 = retryDelay(1); // base * 2^0 = 500
    const d2 = retryDelay(2); // base * 2^1 = 1000
    const d3 = retryDelay(3); // base * 2^2 = 2000
    expect(d2).toBeGreaterThan(d1);
    expect(d3).toBeGreaterThan(d2);
  });

  it('caps at RETRY_MAX_DELAY_MS for high attempt counts', () => {
    // Attempt 5: base * 2^4 = 500 * 16 = 8000 = cap → should equal cap at max random.
    Math.random = () => 1;
    expect(retryDelay(5)).toBeLessThanOrEqual(RETRY_MAX_DELAY_MS);
    expect(retryDelay(10)).toBeLessThanOrEqual(RETRY_MAX_DELAY_MS);
  });

  it('has a non-zero minimum floor (jitter does not go to 0)', () => {
    // With Math.random = 0, delay equals the minDelay floor.
    Math.random = () => 0;
    const floor = retryDelay(1);
    const expectedFloor = RETRY_BASE_DELAY_MS * (1 - RETRY_JITTER_FACTOR);
    expect(floor).toBe(Math.round(expectedFloor));
    expect(floor).toBeGreaterThan(0);
  });

  it('attempt 1 base exponential is RETRY_BASE_DELAY_MS', () => {
    Math.random = () => 1;
    // At max random the full cap = base * 2^0 = base.
    const delay = retryDelay(1);
    expect(delay).toBe(RETRY_BASE_DELAY_MS);
  });
});
