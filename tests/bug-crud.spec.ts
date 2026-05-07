import { test, expect } from '@playwright/test';
import { resetState, loginAsAdmin, gotoBugs, logBug } from './helpers';

test.describe('Bug CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await resetState(page);
    await loginAsAdmin(page);
    await gotoBugs(page);
  });

  test('logs a new bug and shows it in the table', async ({ page }) => {
    const title = await logBug(page, { title: 'Payment fails on submit' });
    await expect(page.locator('table.bugs').getByText(title)).toBeVisible();
  });

  test('blocks submission when required fields are missing', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Bug' }).click();
    await page.getByRole('button', { name: 'Log Bug' }).click();

    await expect(page.getByText('Title is required')).toBeVisible();
    await expect(page.getByText('Description is required')).toBeVisible();
    await expect(page.getByText('Module is required')).toBeVisible();
    await expect(page.getByText('Reporter is required')).toBeVisible();
  });

  test('clears a field-specific error once that field is filled', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Bug' }).click();
    await page.getByRole('button', { name: 'Log Bug' }).click();
    await expect(page.getByText('Title is required')).toBeVisible();

    await page.getByLabel('Title', { exact: false }).fill('A real title');
    await expect(page.getByText('Title is required')).not.toBeVisible();
    await expect(page.getByText('Description is required')).toBeVisible();
  });

  test('opens detail modal when a row is clicked', async ({ page }) => {
    await page.locator('table.bugs tbody tr').first().click();
    await expect(page.getByRole('button', { name: 'Close Bug' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('edits an existing bug and persists changes', async ({ page }) => {
    const title = await logBug(page, { title: 'Original title' });

    await page.locator('table.bugs').getByText(title).click();
    await page.getByRole('button', { name: 'Edit' }).click();

    await expect(page.getByRole('heading', { name: 'Edit Bug' })).toBeVisible();
    const titleInput = page.getByLabel('Title', { exact: false });
    await titleInput.fill('Edited title');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(page.locator('table.bugs').getByText('Edited title')).toBeVisible();
    await expect(page.locator('table.bugs').getByText('Original title')).not.toBeVisible();
  });

  test('marks a bug as Closed via the Close Bug button', async ({ page }) => {
    const title = await logBug(page, { title: 'Close me' });
    await page.locator('table.bugs').getByText(title).click();
    await page.getByRole('button', { name: 'Close Bug' }).click();

    const row = page.locator('table.bugs tbody tr', { hasText: title });
    await expect(row.getByText('Closed')).toBeVisible();
  });

  test('Close Bug button is hidden once the bug is already Closed', async ({ page }) => {
    const title = await logBug(page, { title: 'Already closing' });
    await page.locator('table.bugs').getByText(title).click();
    await page.getByRole('button', { name: 'Close Bug' }).click();

    await page.locator('table.bugs').getByText(title).click();
    await expect(page.getByRole('button', { name: 'Close Bug' })).not.toBeVisible();
  });

  test('deletes a bug after confirmation', async ({ page }) => {
    const title = await logBug(page, { title: 'Doomed bug' });
    await page.locator('table.bugs').getByText(title).click();

    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(page.locator('table.bugs').getByText(title)).not.toBeVisible();
  });

  test('cancels deletion when user dismisses the confirm dialog', async ({ page }) => {
    const title = await logBug(page, { title: 'Surviving bug' });
    await page.locator('table.bugs').getByText(title).click();

    page.once('dialog', dialog => dialog.dismiss());
    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(page.locator('table.bugs').getByText(title)).toBeVisible();
  });

  test('logged bugs persist across page reloads', async ({ page }) => {
    const title = await logBug(page, { title: 'Persisted across reload' });
    await page.reload();
    await gotoBugs(page);
    await expect(page.locator('table.bugs').getByText(title)).toBeVisible();
  });
});
