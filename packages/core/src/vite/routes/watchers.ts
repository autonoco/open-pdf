import path from 'node:path';
import type { ViteDevServer } from 'vite';
import { DOC_ID_RE } from '../../editing/doc-ops.ts';
import { GLOBAL_SCOPE } from '../../files/assets.ts';
import type { ApiContext } from './context.ts';

// Surface folder-manifest and asset-tree mutations as HMR pings so the
// editor's panels can refresh without a full reload.
export function registerWatchers(server: ViteDevServer, ctx: ApiContext): void {
  // The docs root is watched by openPdfPlugin. Do not register the absent
  // manifest as a separate watch: that can hide newly added doc directories.
  server.watcher.on('change', (p) => {
    if (p === ctx.manifestPath) {
      server.ws.send({ type: 'custom', event: 'open-pdf:files-changed' });
    }
  });

  server.watcher.add(ctx.globalAssetsRoot);
  const onAssetChange = (p: string) => {
    if (p.startsWith(ctx.globalAssetsRoot + path.sep) || p === ctx.globalAssetsRoot) {
      server.ws.send({
        type: 'custom',
        event: 'open-pdf:assets-changed',
        data: { docId: GLOBAL_SCOPE },
      });
      return;
    }
    if (!p.startsWith(ctx.docsRoot + path.sep)) return;
    const rel = p.slice(ctx.docsRoot.length + 1);
    const parts = rel.split(path.sep);
    if (parts.length < 3 || parts[1] !== 'assets') return;
    const docId = parts[0];
    if (!DOC_ID_RE.test(docId)) return;
    server.ws.send({
      type: 'custom',
      event: 'open-pdf:assets-changed',
      data: { docId },
    });
  };
  server.watcher.on('add', onAssetChange);
  server.watcher.on('change', onAssetChange);
  server.watcher.on('unlink', onAssetChange);
}
