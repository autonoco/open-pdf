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
import {
  collectImageSrcs,
  DEFAULT_PAGE,
  injectLocAnchors,
  type TakumiNode,
} from '../../../shared/takumi-doc';

export type RenderSource = { docId: string } | { themeId: string };

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

async function handleRender(req: RenderRequest) {
  const start = performance.now();
  const mod = import.meta.env.DEV
    ? await import(/* @vite-ignore */ req.moduleUrl)
    : 'themeId' in req
      ? await loadThemeDemo(req.themeId)
      : await loadDoc(req.docId);
  if (typeof mod.default !== 'function') {
    throw new Error(`Doc module must default-export a component. Got: ${typeof mod.default}`);
  }
  const element = createElement(mod.default);
  const { node, stylesheets } = await fromJsx(element);
  const tags = req.inspect ? injectLocAnchors(node as TakumiNode) : {};
  const pageOptions = mod.pageOptions ?? {};
  // The engine does not fetch image URLs itself — hand it lazy loaders for
  // every src in the tree (dev-server URLs resolve against the worker origin).
  const images = collectImageSrcs(node as TakumiNode).map((src) => ({
    src,
    data: () =>
      fetch(src).then((r) => {
        if (!r.ok) throw new Error(`image fetch failed (${r.status}): ${src}`);
        return r.arrayBuffer();
      }),
  }));
  const bytes: Uint8Array = await render(node, {
    stylesheets,
    images,
    ...DEFAULT_PAGE,
    ...pageOptions,
  });

  const durationMs = performance.now() - start;
  const msg: RenderResponse = { type: 'rendered', seq: req.seq, bytes, durationMs, tags };
  self.postMessage(msg, { transfer: [bytes.buffer] });
}

self.onmessage = (event: MessageEvent<RenderRequest>) => {
  const req = event.data;
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
