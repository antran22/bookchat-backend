const { pathsToModuleNameMapper } = require("ts-jest/utils");
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const { compilerOptions } = require("./tsconfig");

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  setupFilesAfterEnv: ["<rootDir>/tests/fixtures/index.ts"],
  roots: ["<rootDir>/tests/"],
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
  collectCoverageFrom: [
    'src/{config,controllers,models,services,utils}/**/*.{js,ts}',
    '!**/node_modules/**'
  ],
};
