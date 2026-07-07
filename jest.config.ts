import type { Config } from 'jest';

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
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

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
