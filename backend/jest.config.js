const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testPathIgnorePatterns: ["/node_modules/", "/data/", "/build/"],
  transformIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/dist/**/*.test.js"],
  maxWorkers: "50%",
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};
