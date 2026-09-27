import type { ChildProcess } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import {
  enableInspect,
  inspectBoxes,
  prepareScratchProject,
  runCli,
  startCliServer,
  stopServer,
  waitForHttpOk,
} from './helpers.ts';

const FLAGS_CONFIG = `import type { OpenPdfConfig } from '@autono/open-pdf';

const openPdfConfig: OpenPdfConfig = {
  build: { showDocBrowser: false, showDocUi: false },
};

export default openPdfConfig;
`;

test.describe('static build and preview', () => {
  const port = 43119;
  const baseUrl = `http://127.0.0.1:${port}`;
  let projectDir: string;
  let preview: ChildProcess | undefined;

  test.beforeAll(async () => {
    test.setTimeout(300_000);
    projectDir = prepareScratchProject('build');
    const res = await runCli(['build'], projectDir);
    expect(res.code, res.stderr).toBe(0);
    preview = startCliServer(
      ['preview', '--host', '127.0.0.1', '--port', String(port)],
      projectDir,
    );
    await waitForHttpOk(`${baseUrl}/`);
  });

  test.afterAll(async () => {
    if (preview) await stopServer(preview);
  });

  test('emits a single-page bundle with per-doc chunks', async () => {
    const dist = path.join(projectDir, 'dist');
    const entries = await fs.readdir(dist);
    expect(entries.filter((name) => name.endsWith('.html'))).toEqual(['index.html']);

    const html = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
    expect(html).toContain('<div id="root"></div>');
    expect(html).toContain('<title>Autono</title>');

    // Each doc is lazily imported, so it code-splits into at least one chunk
    // per doc plus the entry chunk. Chunk names depend on the bundler, so
    // assert the split happened rather than pinning a naming convention.
    const docCount = 4;
    const assets = await fs.readdir(path.join(dist, 'assets'));
    const jsChunks = assets.filter((name) => name.endsWith('.js'));
    expect(jsChunks.length).toBeGreaterThanOrEqual(docCount + 1);
  });

  test('serves the doc browser from the static bundle', async ({ page }) => {
    await page.goto(`${baseUrl}/`);
    await expect(page.getByText('Alpha Doc')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Tables Doc')).toBeVisible();
  });

  test('deep links resolve through the spa fallback and render', async ({ page }) => {
    await page.goto(`${baseUrl}/s/alpha`);
    await expect(page.locator('main canvas').first()).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('main canvas')).toHaveCount(3);
  });

  test('inspector hit boxes render from the static bundle', async ({ page }) => {
    await page.goto(`${baseUrl}/s/edit-target`);
    await expect(page.locator('main canvas').first()).toBeVisible({ timeout: 60_000 });
    await enableInspect(page);
    await expect(inspectBoxes(page, 'h1')).toHaveCount(1);
    await expect(inspectBoxes(page, 'p')).toHaveCount(1);
  });

  test('dev-only endpoints fall through to the spa fallback in preview', async ({ request }) => {
    const res = await request.get(`${baseUrl}/__server-status`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('text/html');
  });
});

test.describe('build flags', () => {
  const port = 43121;
  const baseUrl = `http://127.0.0.1:${port}`;
  let preview: ChildProcess | undefined;

  test.beforeAll(async () => {
    test.setTimeout(300_000);
    const projectDir = prepareScratchProject('build-flags');
    await fs.writeFile(path.join(projectDir, 'open-pdf.config.ts'), FLAGS_CONFIG);
    const res = await runCli(['build'], projectDir);
    expect(res.code, res.stderr).toBe(0);
    preview = startCliServer(
      ['preview', '--host', '127.0.0.1', '--port', String(port)],
      projectDir,
    );
    await waitForHttpOk(`${baseUrl}/`);
  });

  test.afterAll(async () => {
    if (preview) await stopServer(preview);
  });

  test('showDocBrowser false hides the home browser', async ({ page }) => {
    await page.goto(`${baseUrl}/`);
    await expect(page.getByText('Page not found')).toBeVisible();
  });

  test('showDocUi false serves a bare read-only viewer', async ({ page }) => {
    await page.goto(`${baseUrl}/s/alpha`);
    await expect(page.locator('main canvas').first()).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('header')).toHaveCount(0);
    await expect(page.locator('aside')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Inspect', exact: true })).toHaveCount(0);
  });
});
