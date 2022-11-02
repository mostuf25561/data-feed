"use strict";
export default {
  // stop after first failing test
  bail: true,
  testMatch: ["**/*.test.[jt]s"],
  moduleNameMapper: { "^jest/(.*)$": "<rootDir>/jest/$1" },
  moduleDirectories: ["node_modules", "src"],
  coverageDirectory: "__tests__/coverage",
};
