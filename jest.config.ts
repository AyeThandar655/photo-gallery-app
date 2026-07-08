import type { Config } from 'jest';

// Set EXPO_PUBLIC_* before workers are forked.
// babel-preset-expo's env-inlining plugin reads process.env at babel
// initialisation time (once per worker, before setupFilesAfterEnv runs).
// Values set here are inherited by every worker, so the plugin picks up
// the correct URL instead of inlining `undefined`.
process.env['EXPO_PUBLIC_API_BASE_URL'] = 'http://localhost:3000';

const config: Config = {
  preset: 'jest-expo',

  transform: {
    '^.+\\.(t|j)sx?$|^.+\\.mjs$': [
      'babel-jest',
      { presets: ['babel-preset-expo'] },
    ],
  },

  transformIgnorePatterns: [
    'node_modules/(?!' +
      [
        '(jest-)?react-native',
        '@react-native(-community)?',
        'expo(nent)?',
        '@expo(nent)?/.*',
        '@expo-google-fonts/.*',
        'react-navigation',
        '@react-navigation/.*',
        '@tanstack/.*',
        'msw',
        '@mswjs/.*',
        '@bundled-es-modules/.*',
        'until-async',
        'rettime',
        '@open-draft/.*',
        'headers-utils',
        'strict-event-emitter',
        'undici',
      ].join('|') +
      ')',
  ],

  moduleNameMapper: {
    // msw/node has "react-native": null in its package exports, which blocks
    // resolution when jest-expo applies the react-native condition. Map directly
    // to the CJS build so the Node.js HTTP interceptors are used in Jest tests.
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // MSW v2's node interceptor holds internal HTTP handles that outlive the test
  // worker. forceExit prevents the spurious "worker failed to exit gracefully"
  // warning without masking real open handles in application code.
  forceExit: true,

  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx)',
    '**/__tests__/**/*.spec.(ts|tsx)',
    '**/?(*.)+(spec|test).(ts|tsx)',
  ],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/index.tsx',
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

export default config;
