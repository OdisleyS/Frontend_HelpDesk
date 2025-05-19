// jest.config.js (na raiz do projeto)
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Forneça o caminho para seu app Next.js
  dir: './',
});

// Qualquer configuração customizada que você deseja passar para o Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/context/(.*)$': '<rootDir>/src/context/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
  },
};

// createJestConfig é exportado desta forma para garantir que next/jest possa carregar a configuração Next.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  // carrega os matchers do jest-dom
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // dizer pro ts-jest usar o tsconfig.test.json
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  },

  // mapear seus aliases para Jest
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testMatch: [
    '**/__tests__/**/*.(ts|tsx)',
    '**/?(*.)+(spec|test).(ts|tsx)'
  ]
};

