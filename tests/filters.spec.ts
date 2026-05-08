import { test, expect, Page } from '@playwright/test';
import { resetAndSeed, loginAsTestUser, gotoBugs } from './helpers';
import { STANDARD_FIXTURES } from './firebase';

const tableRows = (page: Page) => page.locator('table.bugs tbody tr');

test.describe('Bug list filters and search', () => {
  test.beforeEach(async ({ page }) => {
    await resetAndSeed(page);
    await loginAsTestUser(page);
    await gotoBugs(page);
  });

  test('renders all seeded fixtures by default', async ({ page }) => {
    await expect(tableRows(page)).toHaveCount(STANDARD_FIXTURES.length);
  });

  test('filters by severity', async ({ page }) => {
    await page.getByRole('combobox').nth(0).selectOption('Critical');
    const expected = STANDARD_FIXTURES.filter((b) => b.severity === 'Critical').length;
    await expect(tableRows(page)).toHaveCount(expected);
    const rows = tableRows(page);
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).getByText('Critical')).toBeVisible();
    }
  });

  test('filters by status', async ({ page }) => {
    await page.getByRole('combobox').nth(1).selectOption('Open');
    const expected = STANDARD_FIXTURES.filter((b) => b.status === 'Open').length;
    await expect(tableRows(page)).toHaveCount(expected);
  });

  test('filters by priority', async ({ page }) => {
    await page.getByRole('combobox').nth(2).selectOption('P1');
    const expected = STANDARD_FIXTURES.filter((b) => b.priority === 'P1').length;
    await expect(tableRows(page)).toHaveCount(expected);
  });

  test('search narrows the table by title', async ({ page }) => {
    await page.getByPlaceholder(/Search title/).fill('Login');
    await expect(tableRows(page)).toHaveCount(1);
    await expect(tableRows(page).first().getByText(/Login button/i)).toBeVisible();
  });

  test('search matches assignee name', async ({ page }) => {
    await page.getByPlaceholder(/Search title/).fill('Priya');
    const expected = STANDARD_FIXTURES.filter((b) => b.assignee === 'Priya').length;
    await expect(tableRows(page)).toHaveCount(expected);
  });

  test('combined filters can produce an empty result set', async ({ page }) => {
    await page.getByRole('combobox').nth(0).selectOption('Critical');
    await page.getByRole('combobox').nth(1).selectOption('Reopened');
    await expect(tableRows(page)).toHaveCount(0);
    await expect(page.getByText(/No bugs match/i)).toBeVisible();
  });

  test('clearing filters restores the full list', async ({ page }) => {
    await page.getByRole('combobox').nth(0).selectOption('Critical');
    await page.getByRole('combobox').nth(0).selectOption('All');
    await expect(tableRows(page)).toHaveCount(STANDARD_FIXTURES.length);
  });

  test('header count reflects active filters', async ({ page }) => {
    await page.getByRole('combobox').nth(1).selectOption('Closed');
    const expected = STANDARD_FIXTURES.filter((b) => b.status === 'Closed').length;
    await expect(
      page.getByText(new RegExp(`${expected} of ${STANDARD_FIXTURES.length}`))
    ).toBeVisible();
  });
});
