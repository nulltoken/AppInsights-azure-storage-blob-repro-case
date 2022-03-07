'use strict';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/__tests__/**/!(_)*.ts'],
  testPathIgnorePatterns: ['.*/__fixtures__/.*\\.ts'],
  collectCoverageFrom: ['src/**/*.{ts,js}', '!**/__tests__/**'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
