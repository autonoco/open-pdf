import { afterEach, expect, it, vi } from 'vitest';
import { reportDocumentError } from './report-error';

afterEach(() => vi.unstubAllGlobals());
it('reports bounded errors without document content or tenant identity', async () => {
  const send = vi.fn(async () => new Response(null, { status: 204 }));
  vi.stubGlobal('fetch', send);
  await reportDocumentError('draft', 'render', new Error('x'.repeat(3000)));
  const [url, init] = send.mock.calls[0] as unknown as [string, RequestInit];
  expect(url).toBe('/__host/client-errors');
  expect(init.credentials).toBe('same-origin');
  expect(JSON.parse(String(init.body))).toEqual({
    documentId: 'draft',
    operation: 'render',
    message: 'x'.repeat(2048),
  });
});
it('does not replace the original UI error if reporting is unavailable', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      throw new Error('offline');
    }),
  );
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  await expect(reportDocumentError('draft', 'export', 'original')).resolves.toBeUndefined();
  expect(warn).toHaveBeenCalled();
  warn.mockRestore();
});
it('supports standalone servers without a hosted error endpoint', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(null, { status: 404 })),
  );
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  await reportDocumentError('draft', 'render', 'original');
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});
