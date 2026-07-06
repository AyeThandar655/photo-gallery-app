import {
  MAX_RETRY_COUNT,
  RETRY_BASE_DELAY_MS,
  RETRY_JITTER_FACTOR,
  RETRY_MAX_DELAY_MS,
} from '@/constants';
import { isAppError, isRetryableError } from '@/utils';

export function smartRetry(failureCount: number, error: unknown): boolean {
  // Hard cap — never exceed MAX_RETRY_COUNT total retries.
  if (failureCount >= MAX_RETRY_COUNT) {
    return false;
  }

  // If it's an AppError we know its retryability exactly.
  if (isAppError(error)) {
    return isRetryableError(error);
  }

  return true;
}

export function retryDelay(failureCount: number): number {
  const exponentialCap = RETRY_BASE_DELAY_MS * Math.pow(2, failureCount - 1);
  const cappedDelay = Math.min(RETRY_MAX_DELAY_MS, exponentialCap);
  const minDelay = cappedDelay * (1 - RETRY_JITTER_FACTOR);
  const jitter = Math.random() * (cappedDelay - minDelay);

  return Math.round(minDelay + jitter);
}
