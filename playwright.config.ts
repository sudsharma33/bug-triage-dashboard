import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';

// Load env from .env.local (Vite convention) before anything else.
loadEnv({ path: '.env.local' });

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  // Tests share one Firebase user + one Firestore "bugs" collection — keep them serial.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY ?? '',
      VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
      VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID ?? '',
      VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
      VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
      VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID ?? '',
    },
  },
});
