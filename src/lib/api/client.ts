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
  response => response,
  (error: unknown) => Promise.reject(normalizeAxiosError(error)),
);
