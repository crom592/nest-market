const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/components/ui/(.*)$': '<rootDir>/src/components/ui/__mocks__/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(next-auth|@babel|@jest|date-fns)/)',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testTimeout: 20000,
  resolver: '<rootDir>/jest.resolver.js',
  projects: [
    {
      displayName: 'api',
      testMatch: ['<rootDir>/src/app/api/**/*.test.[jt]s?(x)'],
      testEnvironment: '<rootDir>/src/lib/test/prisma-test-environment.js',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@lib/(.*)$': '<rootDir>/src/lib/$1',
      },
    },
    {
      displayName: 'components',
      testMatch: [
        '<rootDir>/src/components/**/*.test.[jt]s?(x)',
        '<rootDir>/src/contexts/**/*.test.[jt]s?(x)',
      ],
      testEnvironment: '<rootDir>/src/lib/test/jsdom-test-environment.js',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@lib/(.*)$': '<rootDir>/src/lib/$1',
        '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
      },
    },
  ],
};

module.exports = createJestConfig(customJestConfig);
