import { createHash } from 'node:crypto';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Edit } from './use-editor';

const source = 'export default [() => <><h1>Original</h1><p>Other</p></>];';
const notices = vi.hoisted(() => ({ loading: vi.fn(), success: vi.fn(), error: vi.fn() }));
vi.mock('sonner', () => ({ toast: notices }));
vi.mock('virtual:open-pdf/config', () => ({ default: { docsDir: 'docs' } }));
vi.mock('virtual:open-pdf/docs', () => ({
  docSources: {
    deck: {
      file: 'index.tsx',
      hash: createHash('sha256')
        .update('export default [() => <><h1>Original</h1><p>Other</p></>];')
        .digest('hex'),
    },
  },
}));
let saveWorkerEdits: typeof import('./worker-editor').saveWorkerEdits;
beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  ({ saveWorkerEdits } = await import('./worker-editor'));
});
afterEach(() => vi.unstubAllGlobals());
const edit = (value: string, prevText = 'Original'): Edit => ({
  line: 1,
  column: source.indexOf('<h1'),
  ops: [{ kind: 'set-text', value, prevText }],
});
function server() {
  let content = source;
  let version = 0;
  const streams: ReadableStreamDefaultController[] = [];
  const fetcher = vi.fn(async (url: string, options?: RequestInit) => {
    if (url.startsWith('/__host/publication/')) {
      return new Response(
        new ReadableStream({
          start(c) {
            streams.push(c);
          },
        }),
      );
    }
    if (options?.method === 'PUT') {
      expect((options.headers as Record<string, string>)['If-Match']).toBe(`"${version}"`);
      content = String(options.body);
      version++;
      return Response.json({ revision: String(version), saved: true, changed: true });
    }
    return Response.json({ content, revision: String(version) });
  });
  vi.stubGlobal('fetch', fetcher);
  const complete = (index: number, type = 'workflow_completed') => {
    streams[index].enqueue(new TextEncoder().encode(`${JSON.stringify({ type })}\n`));
    streams[index].close();
  };
  return {
    fetcher,
    streams,
    complete,
    content: () => content,
    external: () => {
      content += '\n';
    },
  };
}
it('returns after the source is saved while publication is still pending', async () => {
  const s = server();
  expect(await saveWorkerEdits('deck', [edit('Updated')])).toEqual([{ ok: true }]);
  expect(s.content()).toContain('Updated');
  expect(s.streams).toHaveLength(1);
  expect(notices.loading).toHaveBeenCalledWith('Saved. Publishing update…', expect.anything());
  expect(notices.success).not.toHaveBeenCalled();
  s.complete(0);
  await vi.waitFor(() => expect(notices.success).toHaveBeenCalledTimes(1));
});
it('saves again against original locations and the latest saved revision', async () => {
  const s = server();
  await saveWorkerEdits('deck', [edit('A much longer heading')]);
  await saveWorkerEdits('deck', [
    edit('Final', 'A much longer heading'),
    {
      line: 1,
      column: source.indexOf('<p'),
      ops: [{ kind: 'set-text', value: 'Other changed', prevText: 'Other' }],
    },
  ]);
  expect(s.content()).toContain('<h1>Final</h1><p>Other changed</p>');
  s.complete(0, 'workflow_errored');
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(notices.error).not.toHaveBeenCalled();
  s.complete(1);
  await vi.waitFor(() => expect(notices.success).toHaveBeenCalledTimes(1));
});
it('keeps a mixed valid/invalid batch entirely unsaved', async () => {
  const s = server();
  await expect(
    saveWorkerEdits('deck', [
      edit('Updated'),
      {
        line: 999,
        column: 0,
        ops: [{ kind: 'set-text', value: 'Invalid' }],
      },
    ]),
  ).rejects.toThrow('No edits saved');
  expect(s.fetcher).toHaveBeenCalledTimes(1);
});
it('reports a publication failure separately and permits the next save', async () => {
  const s = server();
  await saveWorkerEdits('deck', [edit('Updated')]);
  s.complete(0, 'workflow_errored');
  await vi.waitFor(() =>
    expect(notices.error).toHaveBeenCalledWith(
      'Saved. Publication is not confirmed.',
      expect.objectContaining({ description: 'Publishing failed.' }),
    ),
  );
  await saveWorkerEdits('deck', [edit('Final', 'Updated')]);
  expect(s.content()).toContain('Final');
  s.complete(1);
});
it('rejects external changes instead of overwriting them after a previous save', async () => {
  const s = server();
  await saveWorkerEdits('deck', [edit('Updated')]);
  s.external();
  await expect(saveWorkerEdits('deck', [edit('Final', 'Updated')])).rejects.toThrow(
    'Reload before editing',
  );
  expect(s.content()).toContain('Updated');
  s.complete(0);
});
it('honors saved=true when dispatch fails, without marking the edit unsaved', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(Response.json({ content: source, revision: 'a' }))
      .mockResolvedValueOnce(
        Response.json({ saved: true, revision: 'b', error: 'dispatch failed' }, { status: 502 }),
      ),
  );
  expect(await saveWorkerEdits('deck', [edit('Updated')])).toEqual([{ ok: true }]);
  expect(notices.error).toHaveBeenCalledWith(
    'Saved. Publishing could not start.',
    expect.anything(),
  );
});
it('does not accept a conflicting or failed source write as saved', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(Response.json({ content: source, revision: 'a' }))
      .mockResolvedValueOnce(Response.json({ error: 'conflict' }, { status: 409 })),
  );
  await expect(saveWorkerEdits('deck', [edit('Updated')])).rejects.toThrow('Reload before editing');
  expect(notices.loading).not.toHaveBeenCalled();
});

it('preserves subsequent targets after multiline rich text saves', async () => {
  const s = server();
  await saveWorkerEdits('deck', [
    {
      line: 1,
      column: source.indexOf('<h1'),
      ops: [
        {
          kind: 'set-rich-text',
          prevText: 'Original',
          runs: [{ text: 'First\nSecond', style: { fontWeight: '700' } }],
        },
      ],
    },
  ]);
  await saveWorkerEdits('deck', [
    {
      line: 1,
      column: source.indexOf('<p'),
      ops: [{ kind: 'set-text', prevText: 'Other', value: 'Remaining' }],
    },
  ]);
  expect(s.content()).toContain('Remaining');
  expect(s.content()).toContain('First');
  s.complete(0);
  s.complete(1);
});
it('applies text and formatting to the same original element', async () => {
  const s = server();
  await saveWorkerEdits('deck', [
    edit('Longer'),
    {
      line: 1,
      column: source.indexOf('<h1'),
      ops: [{ kind: 'set-style', key: 'color', value: 'red', prevText: 'Longer' }],
    },
  ]);
  expect(s.content()).toContain("color: 'red'");
  expect(s.content()).toContain('Longer');
  s.complete(0);
});
it('reads rich text at rebased locations after an earlier save', async () => {
  const s = server();
  await saveWorkerEdits('deck', [edit('First\nSecond')]);
  const { readWorkerText } = await import('./worker-editor');
  const value = await readWorkerText(
    'deck',
    1,
    source.indexOf('<p'),
    'Other',
    new AbortController().signal,
  );
  expect(value?.text).toBe('Other');
  s.complete(0);
});
