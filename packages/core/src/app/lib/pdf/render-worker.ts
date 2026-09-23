/// <reference lib="webworker" />
// Renders a doc module to PDF bytes off the main thread. The takumi-pdf Vite
// bundler entry top-level-awaits WASM init on first import.

// Dev-only shims, set before any doc-module import: Vite's react-refresh
// runtime (statically imported by every transformed .tsx module) reads
// `window` at eval, and component registration calls the $Refresh* globals
// unguarded. Neither exists in a worker; none of this survives `build`.
const IN_WORKER = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
if (import.meta.env.DEV && IN_WORKER) {
  const g = self as unknown as Record<string, unknown>;
  g.window = self;
  g.$RefreshReg$ = () => {};
  g.$RefreshSig$ = () => (type: unknown) => type;
}

import { loadDoc } from 'virtual:open-pdf/docs';
import { loadThemeDemo } from 'virtual:open-pdf/themes';
import { fromJsx } from '@takumi-rs/helpers/jsx';
import { createElement } from 'react';
import { render } from 'takumi-pdf';
import { type EditableFormat, exportEditable } from '../../../export/editable';
import {
  collectImageSrcs,
  DEFAULT_PAGE,
  injectLocAnchors,
  insetBands,
  type TakumiNode,
} from '../../../shared/takumi-doc';

export type RenderSource = { docId: string } | { themeId: string } | { templateId: string };

export type RenderRequest = RenderSource & {
  type: 'render';
  seq: number;
  /**
   * BASE_URL-prefixed module URL including the HMR cache-bust token. Dev only:
   * a static build imports the bundled chunk through `loadDoc`/`loadThemeDemo`.
   */
  moduleUrl: string;
  /**
   * Inject inspector geometry (loc-tagged nodes become anchors whose link
   * annotations carry exact per-element rects). Off for clean export bytes.
   */
  inspect: boolean;
};

/** Clean one-shot export of a doc as an editable format (Word or Markdown). */
export type ExportRequest = {
  type: 'export';
  seq: number;
  docId: string;
  moduleUrl: string;
  format: EditableFormat;
};

export type ExportResponse =
  | { type: 'exported'; seq: number; bytes: Uint8Array; warnings: string[] }
  | { type: 'export-error'; seq: number; message: string };

export type RenderResponse =
  | {
      type: 'rendered';
      seq: number;
      bytes: Uint8Array;
      durationMs: number;
      /** data-pdf-loc -> original tag name, for the inspector panel. */
      tags: Record<string, string>;
    }
  | { type: 'render-error'; seq: number; message: string };

async function loadModule(req: RenderSource & { moduleUrl: string }) {
  if (!import.meta.env.DEV && 'templateId' in req) {
    throw new Error('Templates are only available in the dev server');
  }
  const mod = import.meta.env.DEV
    ? await import(/* @vite-ignore */ req.moduleUrl)
    : 'themeId' in req
      ? await loadThemeDemo(req.themeId)
      : await loadDoc((req as { docId: string }).docId);
  if (typeof mod.default !== 'function') {
    throw new Error(`Doc module must default-export a component. Got: ${typeof mod.default}`);
  }
  return mod;
}

async function fetchImage(src: string): Promise<ArrayBuffer> {
  const r = await fetch(src);
  if (!r.ok) throw new Error(`image fetch failed (${r.status}): ${src}`);
  return r.arrayBuffer();
}

async function handleExport(req: ExportRequest) {
  const mod = await loadModule(req);
  const { node } = await fromJsx(createElement(mod.default));
  const srcs = collectImageSrcs(node as TakumiNode);
  const images = new Map(
    await Promise.all(
      srcs.map(async (src) => [src, new Uint8Array(await fetchImage(src))] as const),
    ),
  );
  const { bytes, warnings } = await exportEditable(req.format, {
    node: node as TakumiNode,
    title: mod.meta?.title ?? req.docId,
    pageOptions: mod.pageOptions ?? {},
    images,
  });
  const msg: ExportResponse = { type: 'exported', seq: req.seq, bytes, warnings };
  self.postMessage(msg, { transfer: [bytes.buffer] });
}

async function handleRender(req: RenderRequest) {
  const start = performance.now();
  const mod = await loadModule(req);
  const element = createElement(mod.default);
  const { node, css } = await fromJsx(element);
  const tags = req.inspect ? injectLocAnchors(node as TakumiNode) : {};
  const pageOptions = insetBands(mod.pageOptions ?? {});
  // The engine does not fetch image URLs itself — hand it lazy loaders for
  // every src in the tree (dev-server URLs resolve against the worker origin).
  const images = collectImageSrcs(node as TakumiNode).map((src) => ({
    src,
    data: () => fetchImage(src),
  }));
  const bytes: Uint8Array = await render(node, {
    css,
    images,
    ...DEFAULT_PAGE,
    ...pageOptions,
  });

  const durationMs = performance.now() - start;
  const msg: RenderResponse = { type: 'rendered', seq: req.seq, bytes, durationMs, tags };
  self.postMessage(msg, { transfer: [bytes.buffer] });
}

self.onmessage = (event: MessageEvent<RenderRequest | ExportRequest>) => {
  const req = event.data;
  if (req?.type === 'export') {
    handleExport(req).catch((error) => {
      const msg: ExportResponse = {
        type: 'export-error',
        seq: req.seq,
        message: error instanceof Error ? error.message : String(error),
      };
      self.postMessage(msg);
    });
    return;
  }
  if (req?.type !== 'render') return;
  handleRender(req).catch((error) => {
    const msg: RenderResponse = {
      type: 'render-error',
      seq: req.seq,
      message: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(msg);
  });
};

self.postMessage({ type: 'boot' });
