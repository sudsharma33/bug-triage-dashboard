import { Page, expect } from '@playwright/test';
import { TEST_EMAIL, TEST_PASSWORD, deleteAllBugs, seedBugs, STANDARD_FIXTURES } from './firebase';

/**
 * Wipe Firestore bugs and clear any leftover Firebase auth session in the browser.
 * Use in beforeEach for tests that don't need seeded data.
 */
export async function resetState(page: Page): Promise<void> {
  await deleteAllBugs();
  await page.goto('/');
  await page.evaluate(() => {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('firebase:')) localStorage.removeItem(k);
    });
    Object.keys(sessionStorage).forEach((k) => {
      if (k.startsWith('firebase:')) sessionStorage.removeItem(k);
    });
  });
  await page.reload();
}

/**
 * Wipe + seed the standard 6-bug fixture set used by filter/dashboard tests.
 */
export async function resetAndSeed(page: Page): Promise<void> {
  await deleteAllBugs();
  await seedBugs(STANDARD_FIXTURES);
  await page.goto('/');
  await page.evaluate(() => {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('firebase:')) localStorage.removeItem(k);
    });
    Object.keys(sessionStorage).forEach((k) => {
      if (k.startsWith('firebase:')) sessionStorage.removeItem(k);
    });
  });
  await page.reload();
}

/**
 * Log in via the UI as the test user.
 */
export async function loginAsTestUser(page: Page): Promise<void> {
  await page.getByLabel('Email').fill(TEST_EMAIL);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 15_000 });
}

export async function gotoBugs(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Bugs/ }).click();
  await expect(page.getByRole('heading', { name: 'Bugs' })).toBeVisible();
}

export interface BugInput {
  title?: string;
  description?: string;
  module?: string;
  reporter?: string;
  severity?: 'Critical' | 'High' | 'Medium' | 'Low';
  priority?: 'P1' | 'P2' | 'P3' | 'P4';
}

export async function logBug(page: Page, bug: BugInput = {}): Promise<string> {
  const title = bug.title ?? `E2E bug ${Date.now()}`;
  const description = bug.description ?? 'Reproducible with steps below.';
  const module = bug.module ?? 'Checkout';
  const reporter = bug.reporter ?? 'E2E Tester';

  await page.getByRole('button', { name: '+ New Bug' }).first().click();
  await expect(page.getByRole('heading', { name: 'Log New Bug' })).toBeVisible();

  await page.getByLabel('Title', { exact: false }).fill(title);
  await page.getByLabel('Description', { exact: false }).fill(description);
  await page.getByLabel('Module', { exact: false }).fill(module);
  await page.getByLabel('Reporter', { exact: false }).fill(reporter);
  await page.getByLabel('Steps to Reproduce', { exact: false }).fill('1. Open app\n2. Click button');
  await page.getByLabel('Expected Result', { exact: false }).fill('It works');
  await page.getByLabel('Actual Result', { exact: false }).fill('It does not work');

  if (bug.severity) await page.getByLabel('Severity').selectOption(bug.severity);
  if (bug.priority) await page.getByLabel('Priority').selectOption(bug.priority);

  await page.getByRole('button', { name: 'Log Bug' }).click();
  await expect(page.getByRole('heading', { name: 'Log New Bug' })).not.toBeVisible();

  return title;
}
