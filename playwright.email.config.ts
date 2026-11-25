import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/email",
  testMatch: "email-origins.spec.ts",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:4335", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node tests/support/mobile-email-api.cjs",
      url: "http://127.0.0.1:4327/health",
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 4335",
      url: "http://127.0.0.1:4335/confirmar-email",
      timeout: 120000,
      reuseExistingServer: false,
      env: {
        CAPITULANDO_E2E: "1",
        NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:4328",
        MOBILE_API_BASE_URL: "http://127.0.0.1:4327",
      },
    },
  ],
});
