import { defineConfig } from "@playwright/test";

const production = process.env.E2E_PRODUCTION === "1";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["list"],
    [
      "json",
      {
        outputFile: production
          ? "docs/evidence/browser-production-results.json"
          : "docs/evidence/browser-results.json",
      },
    ],
  ],
  use: {
    browserName: "chromium",
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: production
      ? "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort"
      : "npm run dev -- --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
