import path from 'node:path';
import { mergeConfig, build as viteBuild } from 'vite';
import { createViteConfig } from '../vite/config.ts';
import { createCliLogger, printHeader } from './ui.ts';

export interface BuildOptions {
  base?: string;
  assetsDir?: string;
  outDir?: string;
}

export async function build(opts: BuildOptions = {}): Promise<void> {
  printHeader('building for production');
  const base = await createViteConfig({ userCwd: process.cwd(), mode: 'build' });
  const config = mergeConfig(base, {
    customLogger: createCliLogger(),
    ...(opts.base !== undefined ? { base: opts.base } : {}),
    build: {
      ...(opts.assetsDir !== undefined ? { assetsDir: opts.assetsDir } : {}),
      ...(opts.outDir !== undefined ? { outDir: path.resolve(process.cwd(), opts.outDir) } : {}),
    },
  });
  await viteBuild(config);
}
