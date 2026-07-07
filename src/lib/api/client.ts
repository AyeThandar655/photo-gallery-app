import axios from 'axios';
import { REQUEST_TIMEOUT_MS } from '@/constants';
import { normalizeAxiosError } from '@/utils';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  response => {
    // The server signals failures with HTTP 200 + { error: string } body.
    // Treat these as retryable service errors so React Query can retry them.
    if (
      response.data !== null &&
      typeof response.data === 'object' &&
      'error' in response.data
    ) {
      return Promise.reject(
        normalizeAxiosError(
          Object.assign(new Error(String(response.data.error)), {
            response: { ...response, status: 503 },
          }),
        ),
      );
    }
    return response;
  },
  (error: unknown) => Promise.reject(normalizeAxiosError(error)),
);
