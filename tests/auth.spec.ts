import { test, expect } from '@playwright/test';
import { resetState, loginAsTestUser } from './helpers';
import { TEST_EMAIL } from './firebase';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await resetState(page);
  });

  test('shows the login screen when no session exists', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Bug Tracker' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('logs in with the test user credentials', async ({ page }) => {
    await loginAsTestUser(page);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('rejects invalid credentials with an error message', async ({ page }) => {
    await page.getByLabel('Email').fill(TEST_EMAIL);
    await page.getByLabel('Password').fill('definitely-wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    // Firebase returns its own error string, e.g. "Firebase: Error (auth/invalid-credential)."
    await expect(page.getByText(/auth\/|invalid|wrong|incorrect/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Dashboard' })).not.toBeVisible();
  });

  test('signup form is reachable and shows email + password fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
  });

  test('logout clears the session and returns to login', async ({ page }) => {
    await loginAsTestUser(page);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('session persists across page reloads', async ({ page }) => {
    await loginAsTestUser(page);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 15_000 });
  });
});
