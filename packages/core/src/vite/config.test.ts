import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isFileServingAllowed, resolveConfig } from 'vite';
import { describe, expect, it } from 'vitest';
import { createViteConfig } from './config.ts';

const coreNodeModules = fileURLToPath(new URL('../../node_modules', import.meta.url));

describe('createViteConfig server.fs.allow', () => {
  it('serves URL-fetched dependency files to a project outside any workspace', async () => {
    const project = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'open-pdf-hosted-')));
    try {
      const { server } = await createViteConfig({ userCwd: project, config: {} });
      const resolved = await resolveConfig(
        { root: project, configFile: false, logLevel: 'silent', server: { fs: server?.fs } },
        'serve',
      );
      for (const relative of [
        'takumi-pdf/pkg/takumi_pdf_wasm_bg.wasm',
        'pdfjs-dist/build/pdf.worker.min.mjs',
        '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2',
      ]) {
        const file = await fs.realpath(path.join(coreNodeModules, relative));
        expect(isFileServingAllowed(resolved, `/@fs${file}`), relative).toBe(true);
      }
    } finally {
      await fs.rm(project, { recursive: true, force: true });
    }
  });
});
