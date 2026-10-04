import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/tests/**/*.test.ts"],
};

export default config;