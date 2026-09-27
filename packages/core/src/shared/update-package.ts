import { type StdioOptions, spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

export const PKG = '@autono/open-pdf';
const CACHE_TTL_MS = 10 * 60 * 1000;
const COMMAND_TIMEOUT_MS = 300_000;

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';
export type CommandSpec = { cmd: string; args: string[]; shell?: boolean };

let cache: { at: number; latest: string | null } | null = null;

function parseSemver(v: string): [number, number, number] | null {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(v.trim());
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

export function isOutdated(current: string, latest: string): boolean {
  const a = parseSemver(current);
  const b = parseSemver(latest);
  if (!a || !b) return false;
  for (let i = 0; i < 3; i++) {
    if (b[i] > a[i]) return true;
    if (b[i] < a[i]) return false;
  }
  return false;
}

/** npm `latest` dist-tag, cached for 10 minutes. Network failures yield null. */
export async function fetchLatest(now = Date.now()): Promise<string | null> {
  if (cache && now - cache.at < CACHE_TTL_MS) return cache.latest;
  try {
    const res = await fetch(`https://registry.npmjs.org/${PKG}/latest`, {
      signal: AbortSignal.timeout(3000),
      headers: { accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`registry ${res.status}`);
    const body = (await res.json()) as { version?: unknown };
    const latest = typeof body.version === 'string' ? body.version : null;
    cache = { at: now, latest };
    return latest;
  } catch {
    return cache?.latest ?? null;
  }
}

export function invalidateLatestCache(): void {
  cache = null;
}

async function fileExists(file: string): Promise<boolean> {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

// Lockfiles identify the workspace's package manager; npm_config_user_agent
// only identifies the process driving this run (e.g. `npx` in a pnpm repo).
const LOCKFILES: ReadonlyArray<readonly [string, PackageManager]> = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['bun.lockb', 'bun'],
  ['bun.lock', 'bun'],
  ['package-lock.json', 'npm'],
];

const PROJECT_ROOT_MARKERS = ['pnpm-workspace.yaml', '.git'];

async function declaredPackageManager(dir: string): Promise<PackageManager | null> {
  try {
    const raw = await fs.readFile(path.join(dir, 'package.json'), 'utf8');
    const declared = (JSON.parse(raw) as { packageManager?: unknown }).packageManager;
    if (typeof declared !== 'string') return null;
    const name = declared.split('@')[0];
    return name === 'npm' || name === 'pnpm' || name === 'yarn' || name === 'bun' ? name : null;
  } catch {
    return null;
  }
}

async function isProjectRoot(dir: string): Promise<boolean> {
  for (const marker of PROJECT_ROOT_MARKERS) {
    if (await fileExists(path.join(dir, marker))) return true;
  }
  return false;
}

export async function detectPackageManager(cwd: string): Promise<PackageManager> {
  // Workspace members have no lockfile of their own; it lives at the root.
  // The walk stops at the project root so a lockfile in an unrelated
  // ancestor directory never picks the manager.
  let dir = cwd;
  while (true) {
    const declared = await declaredPackageManager(dir);
    if (declared) return declared;
    for (const [lockfile, pm] of LOCKFILES) {
      if (await fileExists(path.join(dir, lockfile))) return pm;
    }
    const parent = path.dirname(dir);
    if (parent === dir || (await isProjectRoot(dir))) break;
    dir = parent;
  }

  const ua = process.env.npm_config_user_agent ?? '';
  if (ua.startsWith('pnpm')) return 'pnpm';
  if (ua.startsWith('yarn')) return 'yarn';
  if (ua.startsWith('bun')) return 'bun';
  return 'npm';
}

export async function updateCommandFor(
  packageManager: PackageManager,
  cwd: string,
): Promise<CommandSpec> {
  switch (packageManager) {
    case 'pnpm': {
      // pnpm rejects plain `add` at a workspace root with ERR_PNPM_ADDING_TO_ROOT.
      const workspaceRoot = await fileExists(path.join(cwd, 'pnpm-workspace.yaml'));
      return {
        cmd: 'pnpm',
        args: workspaceRoot
          ? ['add', '--workspace-root', `${PKG}@latest`]
          : ['add', `${PKG}@latest`],
      };
    }
    case 'yarn':
      return { cmd: 'yarn', args: ['add', `${PKG}@latest`] };
    case 'bun':
      return { cmd: 'bun', args: ['add', `${PKG}@latest`] };
    case 'npm':
      return { cmd: 'npm', args: ['install', `${PKG}@latest`] };
  }
}

/**
 * The freshly installed package's own CLI, so skills come from the new
 * version rather than whatever process is driving the update.
 */
export function localOpenPdfCommand(cwd: string, args: string[]): CommandSpec {
  const bin = path.join(cwd, 'node_modules', ...PKG.split('/'), 'bin.js');
  return { cmd: process.execPath, args: [bin, ...args], shell: false };
}

export function formatCommand(spec: CommandSpec): string {
  return [spec.cmd, ...spec.args].join(' ');
}

export async function runCommand(
  spec: CommandSpec,
  cwd: string,
  opts: { stdio?: StdioOptions } = {},
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(spec.cmd, spec.args, {
      cwd,
      env: process.env,
      shell: spec.shell ?? process.platform === 'win32',
      stdio: opts.stdio ?? ['ignore', 'ignore', 'pipe'],
    });
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`${formatCommand(spec)} timed out`));
    }, COMMAND_TIMEOUT_MS);

    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
      if (stderr.length > 2000) stderr = stderr.slice(-2000);
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve();
        return;
      }
      const detail = stderr.trim();
      reject(new Error(detail || `${formatCommand(spec)} exited with code ${code ?? 'unknown'}`));
    });
  });
}
