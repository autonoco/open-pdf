import { afterEach, expect, it, vi } from 'vitest';
import { reportDocumentError } from './report-error';

afterEach(() => vi.unstubAllGlobals());
it('reports bounded errors without browser-supplied tenant identity', async () => {
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

it('redacts signed and protocol-relative URLs in the retained message', async () => {
  const send = vi.fn(async () => new Response(null, { status: 204 }));
  vi.stubGlobal('fetch', send);
  const signed = `https://user:password@assets.example/private.pdf?X-Amz-Signature=secret#private`;
  await reportDocumentError(
    'draft',
    'render',
    new Error(`Could not load "${signed}" or //cdn.example/image.png?token=secret`),
  );
  const [, init] = send.mock.calls[0] as unknown as [string, RequestInit];
  expect(JSON.parse(String(init.body)).message).toBe(
    'Could not load "[REDACTED_URL]" or [REDACTED_URL]',
  );
});
it.each(['', 'x'.repeat(3000)])(
  'preserves the fallback and size limit after sanitization',
  async (message) => {
    const send = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', send);
    await reportDocumentError('draft', 'export', message);
    const [, init] = send.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(init.body)).message).toBe(message.slice(0, 2048) || 'Unknown error');
  },
);

it.each([true, false])(
  'bounds input before redacting a truncated URL (Error: %s)',
  async (asError) => {
    const send = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', send);
    const message = `Could not load "https://assets.example/file?token=${'secret'.repeat(10000)}" trailing text`;
    await reportDocumentError(
      'draft',
      'render',
      asError ? new Error(message) : { toString: () => message },
    );
    const [, init] = send.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(init.body)).message).toBe('Could not load "[REDACTED_URL]');
  },
);
