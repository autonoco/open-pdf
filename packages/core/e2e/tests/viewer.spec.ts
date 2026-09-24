import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { inspectToggle, openDoc, pdfPages } from './helpers.ts';

test.describe('doc viewer', () => {
  test('renders every page with the doc title and render stats in the header', async ({ page }) => {
    await openDoc(page, 'alpha');
    await expect(page.getByRole('heading', { name: 'Alpha Doc' })).toBeVisible();
    await expect(pdfPages(page)).toHaveCount(3);
    await expect(page.getByText(/^3 pages · \d+ms$/)).toBeVisible();
    await expect(page).toHaveTitle('Alpha Doc — open-pdf');
  });

  test('multi-page docs get a thumbnail rail, single-page docs do not', async ({ page }) => {
    await openDoc(page, 'alpha');
    await expect(page.locator('aside canvas')).toHaveCount(3);

    await openDoc(page, 'edit-target');
    await expect(pdfPages(page)).toHaveCount(1);
    await expect(page.getByText(/^1 page · \d+ms$/)).toBeVisible();
    await expect(page.locator('aside')).toHaveCount(0);
  });

  test('clicking a thumbnail scrolls that page into view', async ({ page }) => {
    await openDoc(page, 'alpha');
    await expect(pdfPages(page)).toHaveCount(3);
    const last = pdfPages(page).nth(2);
    await expect(last).not.toBeInViewport();
    await page.locator('aside button').nth(2).click();
    await expect(last).toBeInViewport();
  });

  test('a long table paginates across pages', async ({ page }) => {
    await openDoc(page, 'tables');
    await expect(page.getByText(/^[2-9] pages · \d+ms$/)).toBeVisible();
    expect(await pdfPages(page).count()).toBeGreaterThanOrEqual(2);
  });

  for (const [item, ext] of [
    ['PDF', 'pdf'],
    ['Word (.docx)', 'docx'],
    ['Markdown (.md)', 'md'],
  ] as const) {
    test(`export hands back the doc as ${ext}`, async ({ page }) => {
      await openDoc(page, 'alpha');
      const trigger = page.getByRole('button', { name: 'Export' });
      await expect(trigger).toBeEnabled();
      await trigger.click();
      const download = page.waitForEvent('download');
      await page.getByRole('menuitem', { name: item }).click();
      const file = await download;
      expect(file.suggestedFilename()).toBe(`alpha.${ext}`);
      const bytes = await readFile((await file.path()) as string);
      expect(bytes.length).toBeGreaterThan(0);
      if (ext === 'md') expect(bytes.toString('utf8')).toContain('# Alpha page one');
      else expect(bytes.subarray(0, 2).toString('latin1')).toBe(ext === 'pdf' ? '%P' : 'PK');
    });
  }

  test('the inspect toggle enables once geometry is ready', async ({ page }) => {
    await openDoc(page, 'alpha');
    await expect(inspectToggle(page)).toBeEnabled({ timeout: 15_000 });
    await expect(inspectToggle(page)).toHaveAttribute('aria-pressed', 'false');
  });

  test('unknown doc ids surface an error instead of rendering forever', async ({ page }) => {
    await page.goto('/s/does-not-exist');
    await expect(page.getByText('Doc not found: does-not-exist')).toBeVisible();
    await expect(page.getByText('Rendering document…')).toHaveCount(0);
  });

  test('back link returns to the doc browser', async ({ page }) => {
    await openDoc(page, 'alpha');
    await page.getByRole('link', { name: 'Back to documents' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('li h3')).toHaveCount(4);
  });
});
