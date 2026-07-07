// Reserved for any global MSW request handlers shared across all test suites.
// Feature-specific handlers are registered in individual test files via server.use().
import type { RequestHandler } from 'msw';

export const handlers: RequestHandler[] = [];
