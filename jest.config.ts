import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: [
    "**/src/**/__tests__/**/*.test.ts",
    "!**/src/**/index.ts",
  ],
  collectCoverage: false,
  collectCoverageFrom: [
    '**/src/**/*.ts',
    '!**/src/common/*.ts',
    '!**/src/**/index.ts',
  ],
  moduleFileExtensions: ['js', 'ts'],
  setupFiles: [
    '<rootDir>jest.setup.ts'
  ]
};
export default config;
