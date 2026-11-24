import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "writing-conflicts.spec.ts",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:4315", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 4315",
    url: "http://127.0.0.1:4315/login",
    timeout: 120000,
    reuseExistingServer: false,
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:8081",
      CAPITULANDO_E2E: "1",
    },
  },
});
