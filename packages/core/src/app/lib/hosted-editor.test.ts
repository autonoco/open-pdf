import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});
async function fixture(href: string, prod: boolean, hosted: boolean) {
  vi.resetModules();
  vi.stubEnv('PROD', prod);
  vi.stubEnv('VITE_BUTTONS_HOSTED', hosted ? 'true' : 'false');
  const assign = vi.fn();
  vi.stubGlobal('window', { location: { href, assign } });
  const { switchHostedEditor } = await import('./hosted-editor');
  return { assign, switchHostedEditor };
}
it('keeps ordinary static deployments and local development unchanged', async () => {
  const f = await fixture('https://example.com/s/invoice', true, false);
  expect(f.switchHostedEditor(true)).toBe(false);
  expect(f.assign).not.toHaveBeenCalled();
});
it('opens the live editor without losing the document, query, or hash', async () => {
  const f = await fixture('https://example.com/s/invoice?view=outline#page2', true, true);
  expect(f.switchHostedEditor(true)).toBe(true);
  expect(f.assign).toHaveBeenCalledWith('https://example.com/s/invoice?view=outline&edit=1#page2');
});
it('returns from live editing to the latest published document', async () => {
  const f = await fixture('https://example.com/s/invoice?edit=1#page2', false, false);
  expect(f.switchHostedEditor(false)).toBe(true);
  expect(f.assign).toHaveBeenCalledWith('https://example.com/s/invoice#page2');
});
