import { server } from './__tests__/setup/server';
import { notifyManager } from '@tanstack/react-query';

// Required for RTL async utilities — set before configuring notifyManager.
global.IS_REACT_ACT_ENVIRONMENT = true;

// Make React Query state updates synchronous so test assertions don't need
// to race against React's scheduler.
notifyManager.setNotifyFunction((fn) => fn());
notifyManager.setBatchNotifyFunction((fn) => fn());

// Suppress React 19 false-positive "not wrapped in act" warning
const _originalConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('not wrapped in act')
  ) {
    return;
  }
  _originalConsoleError(...args);
};

// Provide a real base URL so apiClient builds URLs that MSW can intercept
process.env['EXPO_PUBLIC_API_BASE_URL'] = 'http://localhost:3000';

// Start MSW server before all tests; reset handlers between tests; close after all
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
