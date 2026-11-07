import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    files: ["tests/support/**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  globalIgnores([
    ".next/**",
    ".next-e2e/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
