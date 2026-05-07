import { Page, expect } from '@playwright/test';

/**
 * Clear localStorage before each test to ensure isolation.
 * Run this inside test.beforeEach.
 */
export async function resetState(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

/**
 * Log in with the seeded admin/admin credentials and wait for the dashboard.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

/**
 * Navigate from any logged-in view to the Bugs page.
 */
export async function gotoBugs(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Bugs/ }).click();
  await expect(page.getByRole('heading', { name: 'Bugs' })).toBeVisible();
}

/**
 * Open the New Bug modal and fill in the required fields.
 * Caller can supply overrides; defaults produce a valid bug.
 */
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

  if (bug.severity) await page.getByLabel('Severity').selectOption(bug.severity);
  if (bug.priority) await page.getByLabel('Priority').selectOption(bug.priority);

  await page.getByRole('button', { name: 'Log Bug' }).click();
  await expect(page.getByRole('heading', { name: 'Log New Bug' })).not.toBeVisible();

  return title;
}
