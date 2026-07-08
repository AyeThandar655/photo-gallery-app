import { notifyManager } from '@tanstack/react-query';
import { server } from './__tests__/setup/server';

// Required for RTL async utilities (React 19).
global.IS_REACT_ACT_ENVIRONMENT = true;

// React Query's default scheduler defers state updates via setTimeout, which
// fires outside act() in React 19 and triggers a spurious warning. Overriding
// the scheduler to fire synchronously keeps all updates within the current tick
// so they always occur inside an active act() scope.
notifyManager.setScheduler((fn) => fn());

// Start MSW server before all tests; reset handlers between tests; close after all
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
