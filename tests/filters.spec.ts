import { test, expect, Page } from '@playwright/test';
import { resetState, loginAsAdmin, gotoBugs } from './helpers';

const tableRows = (page: Page) => page.locator('table.bugs tbody tr');

test.describe('Bug list filters and search', () => {
  test.beforeEach(async ({ page }) => {
    await resetState(page);
    await loginAsAdmin(page);
    await gotoBugs(page);
  });

  test('renders all seeded bugs by default', async ({ page }) => {
    await expect(tableRows(page)).toHaveCount(8);
  });

  test('filters by severity', async ({ page }) => {
    await page.getByRole('combobox').nth(0).selectOption('Critical');
    const rows = tableRows(page);
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).getByText('Critical')).toBeVisible();
    }
  });

  test('filters by status', async ({ page }) => {
    await page.getByRole('combobox').nth(1).selectOption('Open');
    const rows = tableRows(page);
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).getByText('Open')).toBeVisible();
    }
  });

  test('filters by priority', async ({ page }) => {
    await page.getByRole('combobox').nth(2).selectOption('P1');
    const rows = tableRows(page);
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).getByText('P1')).toBeVisible();
    }
  });

  test('search narrows the table by title', async ({ page }) => {
    await page.getByPlaceholder(/Search title/).fill('Login');
    const rows = tableRows(page);
    await expect(rows).toHaveCount(1);
    await expect(rows.first().getByText(/Login button/i)).toBeVisible();
  });

  test('search matches assignee name', async ({ page }) => {
    await page.getByPlaceholder(/Search title/).fill('Priya');
    const count = await tableRows(page).count();
    expect(count).toBeGreaterThan(0);
  });

  test('combined filters can produce an empty result set', async ({ page }) => {
    await page.getByRole('combobox').nth(0).selectOption('Critical');
    await page.getByRole('combobox').nth(1).selectOption('Reopened');
    await expect(tableRows(page)).toHaveCount(0);
    await expect(page.getByText(/No bugs match/i)).toBeVisible();
  });

  test('clearing filters restores the full list', async ({ page }) => {
    await page.getByRole('combobox').nth(0).selectOption('Critical');
    const filteredCount = await tableRows(page).count();
    await page.getByRole('combobox').nth(0).selectOption('All');
    const fullCount = await tableRows(page).count();
    expect(fullCount).toBeGreaterThan(filteredCount);
  });

  test('header count reflects active filters', async ({ page }) => {
    await page.getByRole('combobox').nth(1).selectOption('Closed');
    const visible = await tableRows(page).count();
    await expect(page.getByText(new RegExp(`${visible} of 8`))).toBeVisible();
  });
});
