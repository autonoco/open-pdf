import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fromJsx } from '@takumi-rs/helpers/jsx';
import chalk from 'chalk';
import fg from 'fast-glob';
import { createElement } from 'react';
import { render } from 'takumi-pdf';
import { createServer, mergeConfig } from 'vite';
import { EDITABLE_FORMATS, type EditableFormat, exportEditable } from '../export/editable.ts';
import {
  collectImageSrcs,
  DEFAULT_PAGE,
  insetBands,
  type TakumiNode,
} from '../shared/takumi-doc.ts';
import { createViteConfig } from '../vite/config.ts';
import { loadUserConfig } from '../vite/open-pdf-plugin.ts';

export interface ExportOptions {
  /** Doc ids to export. Empty/omitted = every doc in the workspace. */
  docs?: string[];
  /** Output directory, relative to the project root. Default: `export`. */
  outDir?: string;
  /** Output format. Default: pdf. */
  format?: 'pdf' | EditableFormat;
}

const ENTRY_GLOB = '*/index.{tsx,jsx,ts,js}';

/**
 * Dev-server URL -> bytes, without a listening server: Vite emits `/@fs/<abs>`
 * URLs for workspace assets; anything else root-relative resolves against the
 * project; http(s) URLs are fetched.
 */
async function resolveUrlBytes(url: string, userCwd: string): Promise<Uint8Array> {
  const clean = url.replace(/[?#].*$/, '');
  if (/^https?:/.test(clean)) {
    const res = await fetch(clean);
    if (!res.ok) throw new Error(`fetch failed (${res.status}): ${clean}`);
    return new Uint8Array(await res.arrayBuffer());
  }
  const fsPath = clean.startsWith('/@fs/')
    ? decodeURIComponent(clean.slice('/@fs'.length))
    : path.join(userCwd, decodeURIComponent(clean));
  return readFile(fsPath);
}

export async function exportPdfs(opts: ExportOptions = {}): Promise<void> {
  const userCwd = process.cwd();
  const format = opts.format ?? 'pdf';
  if (format !== 'pdf' && !EDITABLE_FORMATS.includes(format)) {
    throw new Error(`Unknown format: ${format} (expected pdf, docx or md)`);
  }
  const config = await loadUserConfig(userCwd);
  const docsDir = config.docsDir ?? 'docs';
  const docsRoot = path.resolve(userCwd, docsDir);
  const outDir = path.resolve(userCwd, opts.outDir ?? 'export');

  const entries = await fg(ENTRY_GLOB, { cwd: docsRoot });
  const idsOnDisk = entries.map((e) => e.split('/')[0]).sort();
  if (idsOnDisk.length === 0) {
    throw new Error(`No docs found under ${docsDir}/`);
  }

  const requested = opts.docs && opts.docs.length > 0 ? opts.docs : idsOnDisk;
  const unknown = requested.filter((id) => !idsOnDisk.includes(id));
  if (unknown.length > 0) {
    throw new Error(`Doc not found: ${unknown.join(', ')} (available: ${idsOnDisk.join(', ')})`);
  }

  // A middleware-mode Vite server compiles the doc TSX with the exact same
  // pipeline the preview uses (plugins, aliases, JSX transform) — no port.
  const base = await createViteConfig({ userCwd, config });
  const server = await createServer(
    mergeConfig(base, {
      server: { middlewareMode: true },
      appType: 'custom',
      // Export only SSR-loads doc modules. Vite 6 otherwise kicks off a
      // client dep scan that errors when the server closes mid-scan.
      optimizeDeps: { noDiscovery: true },
      logLevel: 'error',
    }),
  );

  try {
    await mkdir(outDir, { recursive: true });
    for (const id of requested) {
      const entry = entries.find((e) => e.split('/')[0] === id);
      if (!entry) continue;
      const abs = path.join(docsRoot, entry);
      const started = performance.now();
      const mod = (await server.ssrLoadModule(abs)) as {
        default?: unknown;
        pageOptions?: Record<string, unknown>;
      };
      if (typeof mod.default !== 'function') {
        throw new Error(`${docsDir}/${entry} must default-export a component`);
      }
      const element = createElement(mod.default as Parameters<typeof createElement>[0]);
      const { node, css } = await fromJsx(element);
      const imageEntries = await Promise.all(
        collectImageSrcs(node as TakumiNode).map(async (src) => ({
          src,
          data: await resolveUrlBytes(src, userCwd),
        })),
      );
      const pageOptions = { ...(mod.pageOptions ?? {}) };

      let bytes: Uint8Array;
      if (format !== 'pdf') {
        const meta = (mod as { meta?: { title?: string } }).meta;
        const result = await exportEditable(format, {
          node: node as TakumiNode,
          title: meta?.title ?? id,
          pageOptions,
          images: new Map(imageEntries.map((e) => [e.src, e.data])),
        });
        for (const warning of result.warnings) {
          process.stderr.write(`${chalk.yellow('!')} ${id}: ${warning}\n`);
        }
        bytes = result.bytes;
      } else {
        if (Array.isArray(pageOptions.fonts)) {
          pageOptions.fonts = await Promise.all(
            pageOptions.fonts.map(async (f) =>
              typeof f === 'string' && !/^https?:/.test(f)
                ? { data: await resolveUrlBytes(f, userCwd) }
                : f,
            ),
          );
        }
        bytes = await render(node, {
          css,
          images: imageEntries,
          ...DEFAULT_PAGE,
          ...insetBands(pageOptions),
        });
      }
      const outFile = path.join(outDir, `${id}.${format}`);
      await writeFile(outFile, bytes);
      const ms = Math.round(performance.now() - started);
      const kb = (bytes.length / 1024).toFixed(1);
      process.stdout.write(
        `${chalk.green('ok')}  ${path.relative(userCwd, outFile)}  ${chalk.dim(`${kb} KB · ${ms}ms`)}\n`,
      );
    }
  } finally {
    await server.close();
  }

  const n = requested.length;
  process.stdout.write(
    chalk.dim(`${n} ${n === 1 ? 'document' : 'documents'} → ${path.relative(userCwd, outDir)}/\n`),
  );
}
