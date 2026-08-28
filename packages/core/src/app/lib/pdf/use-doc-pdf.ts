import { docImportUrl } from 'virtual:open-pdf/docs';
import { demoImportUrl } from 'virtual:open-pdf/themes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { docChangeIncludes } from '../docs';
import type { RenderRequest, RenderResponse } from './render-worker';

// One shared worker: renders are serialized in WASM anyway, and sharing keeps
// the module cache (and WASM init cost) across docs.
//
// The worker's module graph top-level-awaits WASM init, so its onmessage
// handler registers late; Chrome drops messages that arrive before then. The
// worker posts {type:'boot'} once ready — gate every send on that.
let workerReady: Promise<Worker> | null = null;
function getWorker(): Promise<Worker> {
  if (!workerReady) {
    const worker = new Worker(new URL('./render-worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.addEventListener('error', (e) => {
      console.error('[open-pdf] render worker error:', e.message, e.filename, e.lineno);
    });
    workerReady = new Promise<Worker>((resolve) => {
      const onBoot = (e: MessageEvent) => {
        if (e.data?.type === 'boot') {
          worker.removeEventListener('message', onBoot);
          resolve(worker);
        }
      };
      worker.addEventListener('message', onBoot);
    });
  }
  return workerReady;
}

let seqCounter = 0;

export type DocPdfState = {
  /** Latest successfully rendered PDF bytes. Stays mounted while re-rendering. */
  bytes: Uint8Array | null;
  /** data-pdf-loc -> tag name for the latest render's inspector geometry. */
  tags: Record<string, string>;
  /** True while a newer render is in flight. */
  rendering: boolean;
  error: string | null;
  durationMs: number | null;
  /** Bumps on every successful render — key remounts of byte consumers. */
  version: number;
};

export function useDocPdf(docId: string): DocPdfState & { rerender: () => void } {
  const [state, setState] = useState<DocPdfState>({
    bytes: null,
    tags: {},
    rendering: true,
    error: null,
    durationMs: null,
    version: 0,
  });
  const latestSeqRef = useRef(0);

  const kick = useCallback(() => {
    const seq = ++seqCounter;
    latestSeqRef.current = seq;
    let moduleUrl: string;
    try {
      moduleUrl = docImportUrl(docId);
    } catch (e) {
      setState((s) => ({
        ...s,
        rendering: false,
        error: e instanceof Error ? e.message : String(e),
      }));
      return;
    }
    setState((s) => ({ ...s, rendering: true, error: null }));

    void getWorker().then((worker) => {
      if (latestSeqRef.current !== seq) return; // superseded while booting
      const onMessage = (event: MessageEvent<RenderResponse>) => {
        const msg = event.data;
        if (msg.seq !== seq || (msg.type !== 'rendered' && msg.type !== 'render-error')) return;
        worker.removeEventListener('message', onMessage);
        if (latestSeqRef.current !== seq) return; // superseded
        if (msg.type === 'rendered') {
          setState((s) => ({
            bytes: msg.bytes,
            tags: msg.tags,
            rendering: false,
            error: null,
            durationMs: msg.durationMs,
            version: s.version + 1,
          }));
        } else {
          // Keep last good bytes visible; surface the error alongside.
          setState((s) => ({ ...s, rendering: false, error: msg.message }));
        }
      };
      worker.addEventListener('message', onMessage);
      const req: RenderRequest = {
        type: 'render',
        seq,
        docId,
        moduleUrl,
        inspect: true,
      };
      worker.postMessage(req);
    });
  }, [docId]);

  useEffect(() => {
    setState({ bytes: null, tags: {}, rendering: true, error: null, durationMs: null, version: 0 });
    kick();
  }, [kick]);

  useEffect(() => {
    if (!import.meta.hot) return;
    let cancelled = false;
    const handler = (data: unknown) => {
      if (docChangeIncludes(data, docId)) {
        // The virtual module updates its bust token on this same event; wait a
        // microtask so docImportUrl() returns the fresh URL.
        queueMicrotask(() => {
          if (!cancelled) kick();
        });
      }
    };
    import.meta.hot.on('open-pdf:doc-changed', handler);
    return () => {
      cancelled = true;
      import.meta.hot?.off('open-pdf:doc-changed', handler);
    };
  }, [docId, kick]);

  return { ...state, rerender: kick };
}

/**
 * Renders a theme's demo doc through the same worker as real docs. Theme file
 * edits trigger a full reload, so there is no HMR re-kick here.
 */
export function useThemeDemoPdf(themeId: string, enabled: boolean): DocPdfState {
  const [state, setState] = useState<DocPdfState>({
    bytes: null,
    tags: {},
    rendering: true,
    error: null,
    durationMs: null,
    version: 0,
  });
  const latestSeqRef = useRef(0);

  useEffect(() => {
    setState({
      bytes: null,
      tags: {},
      rendering: enabled,
      error: null,
      durationMs: null,
      version: 0,
    });
    if (!enabled) return;
    const seq = ++seqCounter;
    latestSeqRef.current = seq;
    let moduleUrl: string;
    try {
      moduleUrl = demoImportUrl(themeId);
    } catch (e) {
      setState((s) => ({
        ...s,
        rendering: false,
        error: e instanceof Error ? e.message : String(e),
      }));
      return;
    }

    void getWorker().then((worker) => {
      if (latestSeqRef.current !== seq) return;
      const onMessage = (event: MessageEvent<RenderResponse>) => {
        const msg = event.data;
        if (msg.seq !== seq || (msg.type !== 'rendered' && msg.type !== 'render-error')) return;
        worker.removeEventListener('message', onMessage);
        if (latestSeqRef.current !== seq) return;
        if (msg.type === 'rendered') {
          setState((s) => ({
            bytes: msg.bytes,
            tags: msg.tags,
            rendering: false,
            error: null,
            durationMs: msg.durationMs,
            version: s.version + 1,
          }));
        } else {
          setState((s) => ({ ...s, rendering: false, error: msg.message }));
        }
      };
      worker.addEventListener('message', onMessage);
      const req: RenderRequest = { type: 'render', seq, themeId, moduleUrl, inspect: false };
      worker.postMessage(req);
    });
  }, [themeId, enabled]);

  return state;
}

/** One-shot clean render (no inspector annotations) for download/export. */
export function renderCleanPdf(docId: string): Promise<Uint8Array> {
  const seq = ++seqCounter;
  return getWorker().then(
    (worker) =>
      new Promise<Uint8Array>((resolve, reject) => {
        const onMessage = (event: MessageEvent<RenderResponse>) => {
          const msg = event.data;
          if (msg.seq !== seq || (msg.type !== 'rendered' && msg.type !== 'render-error')) return;
          worker.removeEventListener('message', onMessage);
          if (msg.type === 'rendered') resolve(msg.bytes);
          else reject(new Error(msg.message));
        };
        worker.addEventListener('message', onMessage);
        const req: RenderRequest = {
          type: 'render',
          seq,
          docId,
          moduleUrl: docImportUrl(docId),
          inspect: false,
        };
        worker.postMessage(req);
      }),
  );
}
