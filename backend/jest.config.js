const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 30000,
  transform: {
    ...tsJestTransformCfg,
  },
  testPathIgnorePatterns: ["/node_modules/", "/data/", "/build/"],
  transformIgnorePatterns: ["/node_modules/"],
  roots: ["src/tests"],
  maxWorkers: "50%",
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};
