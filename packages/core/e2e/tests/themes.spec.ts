import { expect, test } from '@playwright/test';

test.describe('themes', () => {
  test('gallery cards render the demo as a PDF preview', async ({ page }) => {
    await page.goto('/themes');
    await expect(page.getByText('Plain').first()).toBeVisible();
    await expect(page.getByText('Minimal fixture theme for e2e tests.')).toBeVisible();
    await expect(page.locator('li canvas').first()).toBeVisible({ timeout: 30_000 });

    await page.getByRole('button', { name: 'Open theme Plain' }).click();
    await expect(page).toHaveURL(/\/themes\/plain$/);
    await expect(page.getByRole('heading', { name: 'Plain' })).toBeVisible();
  });

  test('detail page renders the demo and pages through it', async ({ page }) => {
    await page.goto('/themes/plain');
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('page 1/2')).toBeVisible();

    const prev = page.getByRole('button', { name: 'Previous page' });
    const next = page.getByRole('button', { name: 'Next page' });
    await expect(prev).toBeDisabled();
    await next.click();
    await expect(page.getByText('page 2/2')).toBeVisible();
    await expect(next).toBeDisabled();
    await prev.click();
    await expect(page.getByText('page 1/2')).toBeVisible();
  });

  test('detail page lists the docs using the theme and links back', async ({ page }) => {
    await page.goto('/themes/plain');
    await expect(page.getByText('Docs using this theme')).toBeVisible();
    await expect(page.getByText('Alpha Doc')).toBeVisible();

    await page.getByRole('button', { name: 'Back to themes' }).click();
    await expect(page).toHaveURL(/\/themes$/);
  });
});
