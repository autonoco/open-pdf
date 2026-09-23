import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { listTemplates } from '../templates-plugin.ts';
import { createDocFromTemplate } from './templates.ts';

let dir: string;
let docsRoot: string;
let templatesRoot: string;

const SOURCE = `export const meta = { title: 'Invoice Classic', createdAt: '2026-01-01T00:00:00.000Z' };
export default function Doc() { return null; }
`;

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'open-pdf-templates-'));
  docsRoot = path.join(dir, 'docs');
  templatesRoot = path.join(dir, 'templates');
  await fs.mkdir(path.join(templatesRoot, 'invoice-classic'), { recursive: true });
  await fs.writeFile(path.join(templatesRoot, 'invoice-classic', 'index.tsx'), SOURCE);
  await fs.mkdir(docsRoot);
});

afterEach(() => fs.rm(dir, { recursive: true, force: true }));

describe('listTemplates', () => {
  it('reads id, title and category', async () => {
    expect(await listTemplates(templatesRoot)).toEqual([
      { id: 'invoice-classic', title: 'Invoice Classic', category: 'invoice' },
    ]);
  });

  it('returns nothing when the directory is missing', async () => {
    expect(await listTemplates(path.join(dir, 'nope'))).toEqual([]);
  });
});

describe('createDocFromTemplate', () => {
  const now = new Date('2026-09-23T12:00:00.000Z');

  it('copies the template and stamps createdAt', async () => {
    const result = await createDocFromTemplate(
      docsRoot,
      templatesRoot,
      'invoice-classic',
      undefined,
      now,
    );
    expect(result).toEqual({ ok: true, docId: 'invoice-classic' });
    const written = await fs.readFile(path.join(docsRoot, 'invoice-classic', 'index.tsx'), 'utf8');
    expect(written).toContain("createdAt: '2026-09-23T12:00:00.000Z'");
    expect(written).toContain("title: 'Invoice Classic'");
  });

  it('picks a free id when the template id is taken', async () => {
    await createDocFromTemplate(docsRoot, templatesRoot, 'invoice-classic');
    const second = await createDocFromTemplate(docsRoot, templatesRoot, 'invoice-classic');
    expect(second).toEqual({ ok: true, docId: 'invoice-classic-2' });
  });

  it('rejects a taken or invalid desired id', async () => {
    await createDocFromTemplate(docsRoot, templatesRoot, 'invoice-classic', 'mine');
    expect(
      await createDocFromTemplate(docsRoot, templatesRoot, 'invoice-classic', 'mine'),
    ).toMatchObject({
      ok: false,
      status: 409,
    });
    expect(
      await createDocFromTemplate(docsRoot, templatesRoot, 'invoice-classic', '../escape'),
    ).toMatchObject({ ok: false, status: 400 });
  });

  it('404s on unknown templates and 400s on path tricks', async () => {
    expect(await createDocFromTemplate(docsRoot, templatesRoot, 'missing')).toMatchObject({
      status: 404,
    });
    expect(await createDocFromTemplate(docsRoot, templatesRoot, '../docs')).toMatchObject({
      status: 400,
    });
  });
});
