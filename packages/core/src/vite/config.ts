import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { type InlineConfig, searchForWorkspaceRoot } from 'vite';
import { apiPlugin } from './api-plugin.ts';
import { currentPlugin } from './current-plugin.ts';
import { designPlugin } from './design-plugin.ts';
import { locTagsPlugin } from './loc-tags-plugin.ts';
import { notesPlugin } from './notes-plugin.ts';
import { loadUserConfig, type OpenPdfConfig, openPdfPlugin } from './open-pdf-plugin.ts';
import { themesPlugin } from './themes-plugin.ts';

function findPackageRoot(fromFile: string): string {
  let dir = path.dirname(fromFile);
  while (dir !== path.dirname(dir)) {
    if (existsSync(path.join(dir, 'package.json'))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error(`Could not find package.json walking up from ${fromFile}`);
}

const PKG_ROOT = findPackageRoot(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(PKG_ROOT, 'src', 'app');

function readCoreVersion(): string {
  try {
    const raw = readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf8');
    return (JSON.parse(raw) as { version?: string }).version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

const CORE_VERSION = readCoreVersion();

export type CreateViteConfigOptions = {
  userCwd: string;
  config?: OpenPdfConfig;
  mode?: 'serve' | 'build';
};

export async function createViteConfig(opts: CreateViteConfigOptions): Promise<InlineConfig> {
  const userCwd = path.resolve(opts.userCwd);
  const config = opts.config ?? (await loadUserConfig(userCwd));
  const docsDir = config.docsDir ?? 'docs';
  const themesDir = config.themesDir ?? 'themes';
  const assetsDir = config.assetsDir ?? 'assets';
  const docsAbs = path.resolve(userCwd, docsDir);
  const themesAbs = path.resolve(userCwd, themesDir);
  const assetsAbs = path.resolve(userCwd, assetsDir);

  return {
    base: config.base ?? '/',
    root: APP_ROOT,
    configFile: false,
    envDir: userCwd,
    plugins: [
      locTagsPlugin({ userCwd, docsDir }),
      react(),
      tailwindcss(),
      openPdfPlugin({ userCwd, config, coreVersion: CORE_VERSION }),
      themesPlugin({ userCwd, config }),
      designPlugin({ userCwd }),
      apiPlugin({ userCwd, docsDir, assetsDir, coreVersion: CORE_VERSION }),
      notesPlugin({ userCwd, docsDir }),
      currentPlugin({ userCwd, docsDir }),
    ],
    resolve: {
      alias: {
        '@': APP_ROOT,
        '@assets': assetsAbs,
      },
    },
    optimizeDeps: {
      entries: [path.join(APP_ROOT, 'main.tsx')],
      // takumi-pdf's Vite entry top-level-awaits WASM init; esbuild pre-bundling
      // targets es2020 and rejects TLA. Serve it as native ESM instead.
      exclude: ['takumi-pdf', '@takumi-rs/helpers'],
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'next-themes',
        'react-router-dom',
        '@base-ui/react',
        // @base-ui/utils reaches for the CommonJS use-sync-external-store shim
        // (React 17 fallback). Left un-optimized, its named `useSyncExternalStore`
        // export fails ESM interop in the browser — pre-bundle it to fix that.
        // (@base-ui/utils itself has no "." export, so we can't list it here.)
        'use-sync-external-store/shim',
        'use-sync-external-store/shim/with-selector',
        'lucide-react',
        'clsx',
        'tailwind-merge',
        'class-variance-authority',
        'emoji-picker-react',
      ],
      // The app source ships inside node_modules/@autono/open-pdf/src/app, so
      // Vite's dep scanner traverses it as if it were a third-party dep and
      // tries to bundle our virtual imports with esbuild. Mark them external.
      esbuildOptions: {
        target: 'es2022',
        plugins: [
          {
            name: 'open-pdf:virtual-externals',
            setup(build) {
              build.onResolve({ filter: /^virtual:open-pdf\// }, (args) => ({
                path: args.path,
                external: true,
              }));
            },
          },
        ],
      },
    },
    server: {
      port: config.port ?? 5173,
      ...(config.allowedHosts !== undefined ? { allowedHosts: config.allowedHosts } : {}),
      fs: {
        // The workspace root covers node_modules however the package manager
        // lays it out (incl. pnpm's virtual store realpaths for fonts + WASM).
        allow: [
          APP_ROOT,
          PKG_ROOT,
          searchForWorkspaceRoot(userCwd),
          userCwd,
          docsAbs,
          themesAbs,
          assetsAbs,
        ],
      },
    },
    build: {
      outDir: path.resolve(userCwd, 'dist'),
      emptyOutDir: true,
      // The render worker top-level-awaits WASM init; the default es2020
      // target and iife worker format both reject that.
      target: 'es2022',
    },
    worker: {
      format: 'es',
      // Worker bundles get their own plugin pipeline; the render worker imports
      // the docs virtual module and needs loc tags for inspector geometry.
      // This pipeline only runs at build time (dev workers go through the
      // root pipeline), so the plugin's serve-only default would skip it.
      plugins: () => [
        locTagsPlugin({ userCwd, docsDir, apply: 'build' }),
        openPdfPlugin({ userCwd, config, coreVersion: CORE_VERSION }),
        themesPlugin({ userCwd, config }),
      ],
    },
  };
}

export { APP_ROOT };
