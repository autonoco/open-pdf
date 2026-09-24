import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createServer } from 'vite';
import { describe, expect, it, vi } from 'vitest';
import { apiPlugin } from './api-plugin.ts';
import { generateDocsModule, openPdfPlugin } from './open-pdf-plugin.ts';

async function withDocsRoot<T>(fn: (root: string) => Promise<T>): Promise<T> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'open-pdf-test-'));
  try {
    return await fn(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

async function writeDoc(root: string, id: string): Promise<string> {
  await fs.mkdir(path.join(root, id), { recursive: true });
  const entry = path.join(root, id, 'index.tsx');
  await fs.writeFile(
    entry,
    `export const meta = { title: '${id}' };\nexport default [];\n`,
    'utf8',
  );
  return entry;
}

describe('generateDocsModule', () => {
  it('keeps docs whose id is ASCII-safe and reports none ignored', async () => {
    await withDocsRoot(async (root) => {
      const files = [await writeDoc(root, 'cover'), await writeDoc(root, 'intro_2')].sort();

      const { code, ignored } = await generateDocsModule(files, root, false);

      expect(ignored).toEqual([]);
      expect(code).toContain('export const docIds = ["cover","intro_2"];');
    });
  });

  it('excludes folders whose id is not ASCII-safe and reports them as ignored', async () => {
    await withDocsRoot(async (root) => {
      const files = [await writeDoc(root, 'cover'), await writeDoc(root, '推薦系統')].sort();

      const { code, ignored } = await generateDocsModule(files, root, false);

      expect(ignored).toEqual(['推薦系統']);
      expect(code).toContain('export const docIds = ["cover"];');
      expect(code).not.toContain('推薦系統');
    });
  });
});

describe('openPdfPlugin file watching', () => {
  it('reloads when a new document directory is discovered', async () => {
    await withDocsRoot(async (root) => {
      await fs.mkdir(path.join(root, 'docs'));
      const server = await createServer({
        root,
        configFile: false,
        plugins: [openPdfPlugin({ userCwd: root, config: {}, coreVersion: 'test' })],
        server: { middlewareMode: true },
      });
      try {
        const send = vi.spyOn(server.ws, 'send');
        server.watcher.emit('addDir', path.join(root, 'docs', 'new-doc'));
        await vi.waitFor(() => expect(send).toHaveBeenCalledWith({ type: 'full-reload' }), {
          timeout: 2000,
        });
      } finally {
        await server.close();
      }
    });
  });

  it('discovers a document directory created after the dev server starts', async () => {
    await withDocsRoot(async (root) => {
      const docsRoot = path.join(root, 'docs');
      await fs.mkdir(docsRoot);
      const addCalls: unknown[][] = [];
      const server = await createServer({
        root,
        configFile: false,
        plugins: [
          {
            name: 'test:capture-watches',
            enforce: 'pre',
            configureServer(server) {
              const add = server.watcher.add.bind(server.watcher);
              vi.spyOn(server.watcher, 'add').mockImplementation((...args) => {
                addCalls.push(args);
                return add(...args);
              });
            },
          },
          openPdfPlugin({ userCwd: root, config: {}, coreVersion: 'test' }),
          apiPlugin({ userCwd: root, templatesRoot: root, coreVersion: 'test' }),
        ],
        server: { middlewareMode: true },
      });
      try {
        expect(addCalls.flat()).not.toContain(path.join(docsRoot, '.folders.json'));
        await vi.waitFor(() => expect(server.watcher.getWatched()[docsRoot]).toBeDefined());
        expect((await server.transformRequest('virtual:open-pdf/docs'))?.code).toContain(
          'export const docIds = [];',
        );
        const send = vi.spyOn(server.ws, 'send');
        const addedDirectory = new Promise<string>((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(new Error('new directory was not watched')),
            2000,
          );
          server.watcher.on('addDir', (dir) => {
            if (dir === path.join(docsRoot, 'new-doc')) {
              clearTimeout(timeout);
              resolve(dir);
            }
          });
        });
        await writeDoc(docsRoot, 'new-doc');
        expect(await addedDirectory).toBe(path.join(docsRoot, 'new-doc'));
        await vi.waitFor(() => expect(send).toHaveBeenCalledWith({ type: 'full-reload' }), {
          timeout: 2000,
        });
        expect((await server.transformRequest('virtual:open-pdf/docs'))?.code).toContain(
          'export const docIds = ["new-doc"];',
        );
      } finally {
        await server.close();
      }
    });
  });
});
