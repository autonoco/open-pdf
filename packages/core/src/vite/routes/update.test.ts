import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { localOpenPdfCommand } from '../../shared/update-package.ts';
import { detectPackageManager, updateCommandFor } from './update.ts';

async function tempProject(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), 'open-pdf-update-'));
}

describe('update routes helpers', () => {
  const originalUserAgent = process.env.npm_config_user_agent;

  afterEach(() => {
    if (originalUserAgent === undefined) {
      delete process.env.npm_config_user_agent;
    } else {
      process.env.npm_config_user_agent = originalUserAgent;
    }
  });

  it('prefers workspace lockfiles over the npm user agent', async () => {
    const cwd = await tempProject();
    await fs.writeFile(path.join(cwd, 'pnpm-lock.yaml'), '');
    process.env.npm_config_user_agent = 'yarn/1.22.22 npm/? node/? darwin x64';

    await expect(detectPackageManager(cwd)).resolves.toBe('pnpm');
  });

  it('detects package managers from lockfiles', async () => {
    const cwd = await tempProject();
    delete process.env.npm_config_user_agent;

    await fs.writeFile(path.join(cwd, 'pnpm-lock.yaml'), '');
    await expect(detectPackageManager(cwd)).resolves.toBe('pnpm');

    await fs.rm(path.join(cwd, 'pnpm-lock.yaml'));
    await fs.writeFile(path.join(cwd, 'bun.lock'), '');
    await expect(detectPackageManager(cwd)).resolves.toBe('bun');

    await fs.rm(path.join(cwd, 'bun.lock'));
    await fs.writeFile(path.join(cwd, 'package-lock.json'), '');
    await expect(detectPackageManager(cwd)).resolves.toBe('npm');
  });

  it('finds the lockfile in an ancestor workspace root', async () => {
    const root = await tempProject();
    delete process.env.npm_config_user_agent;
    const cwd = path.join(root, 'packages', 'docs');
    await fs.mkdir(cwd, { recursive: true });
    await fs.writeFile(path.join(root, 'bun.lock'), '');

    await expect(detectPackageManager(cwd)).resolves.toBe('bun');
  });

  it('does not look past the project root for a lockfile', async () => {
    const root = await tempProject();
    delete process.env.npm_config_user_agent;
    await fs.writeFile(path.join(root, 'pnpm-lock.yaml'), '');
    const cwd = path.join(root, 'project');
    await fs.mkdir(path.join(cwd, '.git'), { recursive: true });

    await expect(detectPackageManager(cwd)).resolves.toBe('npm');
  });

  it('honours a packageManager declaration over lockfiles', async () => {
    const cwd = await tempProject();
    delete process.env.npm_config_user_agent;
    await fs.writeFile(path.join(cwd, 'pnpm-lock.yaml'), '');
    await fs.writeFile(
      path.join(cwd, 'package.json'),
      JSON.stringify({ packageManager: 'bun@1.2.0' }),
    );

    await expect(detectPackageManager(cwd)).resolves.toBe('bun');
  });

  it('falls back to the npm user agent without a lockfile', async () => {
    const cwd = await tempProject();

    process.env.npm_config_user_agent = 'yarn/1.22.22 npm/? node/? darwin x64';
    await expect(detectPackageManager(cwd)).resolves.toBe('yarn');

    delete process.env.npm_config_user_agent;
    await expect(detectPackageManager(cwd)).resolves.toBe('npm');
  });

  it('uses fixed update commands for each package manager', async () => {
    const cwd = await tempProject();
    await expect(updateCommandFor('pnpm', cwd)).resolves.toEqual({
      cmd: 'pnpm',
      args: ['add', '@autono/open-pdf@latest'],
    });
    await expect(updateCommandFor('yarn', cwd)).resolves.toEqual({
      cmd: 'yarn',
      args: ['add', '@autono/open-pdf@latest'],
    });
    await expect(updateCommandFor('bun', cwd)).resolves.toEqual({
      cmd: 'bun',
      args: ['add', '@autono/open-pdf@latest'],
    });
    await expect(updateCommandFor('npm', cwd)).resolves.toEqual({
      cmd: 'npm',
      args: ['install', '@autono/open-pdf@latest'],
    });
  });

  it('adds --workspace-root for pnpm at a workspace root', async () => {
    const cwd = await tempProject();
    await fs.writeFile(path.join(cwd, 'pnpm-workspace.yaml'), 'packages:\n  - "packages/*"\n');

    await expect(updateCommandFor('pnpm', cwd)).resolves.toEqual({
      cmd: 'pnpm',
      args: ['add', '--workspace-root', '@autono/open-pdf@latest'],
    });
  });

  it('runs the local CLI through node without a shell', async () => {
    const cwd = await tempProject();
    const spec = localOpenPdfCommand(cwd, ['sync:skills']);

    expect(spec.cmd).toBe(process.execPath);
    expect(spec.args).toEqual([
      path.join(cwd, 'node_modules', '@autono', 'open-pdf', 'bin.js'),
      'sync:skills',
    ]);
    expect(spec.shell).toBe(false);
  });
});
