import { test, expect } from '@playwright/test';
import { resetState, loginAsAdmin, gotoBugs, logBug } from './helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await resetState(page);
    await loginAsAdmin(page);
  });

  test('renders the four stat cards', async ({ page }) => {
    await expect(page.getByText('Total Bugs')).toBeVisible();
    await expect(page.getByText('Open', { exact: true })).toBeVisible();
    await expect(page.getByText('Critical / High')).toBeVisible();
    await expect(page.getByText('Closed', { exact: true })).toBeVisible();
  });

  test('total bugs count matches seeded sample size', async ({ page }) => {
    const total = page
      .locator('.stat-card', { hasText: 'Total Bugs' })
      .locator('.value');
    await expect(total).toHaveText('8');
  });

  test('renders all five chart cards with canvases', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Bugs by Severity' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bugs by Status' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bugs by Priority' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bugs by Module' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Last 7 Days/ })).toBeVisible();

    await expect(page.locator('.chart-card canvas')).toHaveCount(5);
  });

  test('Closed stat increments after closing a bug', async ({ page }) => {
    const closedStat = page
      .locator('.stat-card', { hasText: /^Closed/ })
      .locator('.value');
    const before = parseInt((await closedStat.textContent()) ?? '0', 10);

    await gotoBugs(page);
    const title = await logBug(page, { title: 'For closing on dashboard' });
    await page.locator('table.bugs').getByText(title).click();
    await page.getByRole('button', { name: 'Close Bug' }).click();

    await page.getByRole('button', { name: /Dashboard/ }).click();
    await expect(closedStat).toHaveText(String(before + 1));
  });

  test('Total Bugs stat increments after logging a new bug', async ({ page }) => {
    const totalStat = page
      .locator('.stat-card', { hasText: 'Total Bugs' })
      .locator('.value');
    const before = parseInt((await totalStat.textContent()) ?? '0', 10);

    await gotoBugs(page);
    await logBug(page, { title: 'Increments total stat' });

    await page.getByRole('button', { name: /Dashboard/ }).click();
    await expect(totalStat).toHaveText(String(before + 1));
  });

  test('quick + New Bug button on dashboard opens the form', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Bug' }).click();
    await expect(page.getByRole('heading', { name: 'Log New Bug' })).toBeVisible();
  });
});
