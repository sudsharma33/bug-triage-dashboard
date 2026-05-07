import { test, expect } from '@playwright/test';
import { resetState, loginAsAdmin } from './helpers';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await resetState(page);
  });

  test('shows the login screen when no session exists', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Bug Tracker' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByText(/admin \/ admin/i)).toBeVisible();
  });

  test('logs in with seeded admin credentials', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByText('admin', { exact: true })).toBeVisible();
  });

  test('rejects invalid credentials with an error message', async ({ page }) => {
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Invalid username or password.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).not.toBeVisible();
  });

  test('signup creates a new account and logs the user in', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.getByLabel('Username').fill('e2e-newbie');
    await page.getByLabel('Password').fill('strongpw');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('e2e-newbie')).toBeVisible();
  });

  test('signup rejects duplicate usernames', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('whatever');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText(/taken/i)).toBeVisible();
  });

  test('logout clears the session and returns to login', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

    const session = await page.evaluate(() => localStorage.getItem('bt_session'));
    expect(session).toBeNull();
  });

  test('session persists across page reloads', async ({ page }) => {
    await loginAsAdmin(page);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
