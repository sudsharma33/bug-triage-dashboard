import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';

// Load env from .env.local — needed for the Node-side Firebase admin
// client (tests/firebase.ts) that cleans + seeds Firestore between tests.
loadEnv({ path: '.env.local' });

export default defineConfig({
  testDir: './tests',
  timeout: 60_000, // bumped — network round-trips to Vercel + Firebase add latency
  expect: {
    timeout: 10_000,
  },
  // Tests share one Firebase user + one Firestore "bugs" collection — keep them serial.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    // Tests run against the deployed Vercel site, not a local server.
    baseURL: 'https://bug-triage-dashboard.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // No webServer block — we hit the deployed site directly.
});
