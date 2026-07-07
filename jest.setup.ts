import { server } from './__tests__/setup/server';
import { notifyManager } from '@tanstack/react-query';

// Configure notifyManager to run synchronously in tests
notifyManager.setNotifyFunction((fn) => fn());
notifyManager.setBatchNotifyFunction((fn) => fn());

// Required for RTL async utilities
global.IS_REACT_ACT_ENVIRONMENT = true;

// Provide a real base URL so apiClient builds URLs that MSW can intercept
process.env['EXPO_PUBLIC_API_BASE_URL'] = 'http://localhost:3000';

// Start MSW server before all tests; reset handlers between tests; close after all
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
