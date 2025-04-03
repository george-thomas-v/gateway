import 'tsconfig-paths/register';

export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../',
  testEnvironment: 'node',
  testRegex: '.*\\.e2e-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@app/enums$': '<rootDir>/src/data/enums',  
    '^@app/entities$': '<rootDir>/src/data/entities',
    '^@app/repositories$': '<rootDir>/src/data/repositories',
    '^@app/utils$': '<rootDir>/src/utils',
    '^@app/libs$': '<rootDir>/src/libs',
    '^@app/types$': '<rootDir>/src/types',
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  roots: ['<rootDir>/src', '<rootDir>/test'],
};
