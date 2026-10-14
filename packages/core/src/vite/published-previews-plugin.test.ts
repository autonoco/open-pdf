import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build, createServer } from 'vite';
import { afterEach, expect, it } from 'vitest';
import { publishedPreviewsPlugin } from './published-previews-plugin.ts';

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })));
});
async function fixture(documents?: unknown[]) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'published-previews-'));
  roots.push(root);
  const directory = path.join(root, '.documents');
  await fs.mkdir(directory);
  await fs.writeFile(
    path.join(root, 'entry.js'),
    "import previews from 'virtual:open-pdf/previews'; console.log(previews);",
  );
  if (documents)
    await fs.writeFile(
      path.join(directory, 'index.json'),
      JSON.stringify({ version: 1, kind: 'pdfs', documents }),
    );
  return { root, directory };
}
function bundle(root: string, directory: string) {
  return build({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: [publishedPreviewsPlugin(directory)],
    build: {
      write: false,
      assetsInlineLimit: 0,
      rolldownOptions: { input: path.join(root, 'entry.js') },
    },
  });
}
it('builds an un-published project without requiring a preview index', async () => {
  const { root, directory } = await fixture();
  await expect(bundle(root, directory)).resolves.toBeDefined();
});
it('emits saved previews as assets while preserving failed-preview null entries', async () => {
  const filename = `${'a'.repeat(64)}.png`;
  const { root, directory } = await fixture([
    { id: 'example', thumbnail: filename },
    { id: 'failed', thumbnail: null },
  ]);
  await fs.writeFile(path.join(directory, filename), Buffer.from('89504e470d0a1a0a', 'hex'));
  const result = await bundle(root, directory);
  const outputs = Array.isArray(result)
    ? result.flatMap((x) => x.output)
    : 'output' in result
      ? result.output
      : [];
  expect(outputs.some((x) => x.type === 'asset' && x.fileName.endsWith('.png'))).toBe(true);
  expect(outputs.some((x) => x.type === 'chunk' && x.code.includes('failed:null'))).toBe(true);
});
it.each(['../private.png', '/private.png', 'invalid.png'])(
  'rejects unsafe or unversioned preview paths: %s',
  async (thumbnail) => {
    const { root, directory } = await fixture([{ id: 'example', thumbnail }]);
    await expect(bundle(root, directory)).rejects.toThrow('Invalid preview filename');
  },
);
it('rejects a symbolic link masquerading as an image', async () => {
  const filename = `${'a'.repeat(64)}.png`;
  const { root, directory } = await fixture([{ id: 'example', thumbnail: filename }]);
  await fs.symlink(path.join(root, 'entry.js'), path.join(directory, filename));
  await expect(bundle(root, directory)).rejects.toThrow('Invalid preview image');
});

it('keeps editing previews live even when a published index exists', async () => {
  const { root, directory } = await fixture([{ id: 'example', thumbnail: 'invalid.png' }]);
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: [publishedPreviewsPlugin(directory)],
    server: { middlewareMode: true },
  });
  try {
    const result = await server.transformRequest('virtual:open-pdf/previews');
    expect(result?.code).toContain('export default {}');
  } finally {
    await server.close();
  }
});
it('identifies the document when a published image is missing', async () => {
  const thumbnail = `${'a'.repeat(64)}.png`;
  const { root, directory } = await fixture([{ id: 'example', thumbnail }]);
  await expect(bundle(root, directory)).rejects.toThrow(
    `Cannot read preview for example: ${thumbnail}`,
  );
});
