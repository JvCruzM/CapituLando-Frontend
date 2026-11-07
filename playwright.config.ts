import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  workers: 1,
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node tests/support/mail-server.cjs",
      url: "http://127.0.0.1:1025",
      reuseExistingServer: false,
    },
    {
      command: "node tests/support/backend.cjs",
      url: "http://127.0.0.1:8081/actuator/health",
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 3001",
      url: "http://127.0.0.1:3001/login",
      timeout: 120_000,
      env: {
        NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:8081",
        CAPITULANDO_E2E: "1",
      },
      reuseExistingServer: false,
    },
  ],
});
