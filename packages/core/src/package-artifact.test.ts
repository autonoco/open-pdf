import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

test('published viewer includes the shared module imported by its PDF viewer', () => {
  const packageDirectory = fileURLToPath(new URL('..', import.meta.url));
  const result = spawnSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: packageDirectory,
    encoding: 'utf8',
  });

  expect(result.status, result.stderr).toBe(0);
  const [artifact] = JSON.parse(result.stdout) as [{ files: { path: string }[] }];
  expect(artifact.files.map((file) => file.path)).toContain('src/shared/takumi-doc.ts');
});
