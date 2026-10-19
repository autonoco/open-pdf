import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { workerEditorEnabled } from './worker-editor-config';

afterEach(() => vi.unstubAllEnvs());
it('uses the configured env directory and process environment precedence', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'pdf-worker-env-'));
  try {
    vi.stubEnv('VITE_BUTTONS_WORKER_EDITOR', undefined);
    await writeFile(join(directory, '.env.production'), 'VITE_BUTTONS_WORKER_EDITOR=true\n');
    const config = { envDir: directory };
    expect(workerEditorEnabled(config, { command: 'build', mode: 'production' }, '/unused')).toBe(
      true,
    );
    expect(workerEditorEnabled(config, { command: 'serve', mode: 'production' }, '/unused')).toBe(
      false,
    );
    vi.stubEnv('VITE_BUTTONS_WORKER_EDITOR', 'false');
    expect(workerEditorEnabled(config, { command: 'build', mode: 'production' }, '/unused')).toBe(
      false,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
