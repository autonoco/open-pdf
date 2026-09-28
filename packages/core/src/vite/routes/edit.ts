import fs from 'node:fs/promises';
import type { ViteDevServer } from 'vite';
import { applyEdit, type EditOp, readRichText } from '../../editing/edit-ops.ts';
import { applyRevertAsset } from '../../editing/revert-asset.ts';
import { validateMutationRequest } from '../../http/request-guard.ts';
import { type ApiContext, json, readBody, resolveDocEntryPath } from './context.ts';

// GET  /__edit/text           readRichText(?docId&line&column[&text]) → { text, runs, rich }
// POST /__edit                applyEdit({ docId, line, column, ops })
// POST /__edit/revert-asset   applyRevertAsset({ docId, assetPath })
// POST /__edit/batch          applyEdit × N — single FS write per request

type EditBody = {
  docId?: string;
  line?: number;
  column?: number;
  ops?: EditOp[];
};

type EditBatchBody = {
  docId?: string;
  edits?: Array<{ line?: number; column?: number; ops?: EditOp[] }>;
};

export function registerEditRoutes(server: ViteDevServer, ctx: ApiContext): void {
  server.middlewares.use('/__edit', async (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://local');
    const method = req.method ?? 'GET';
    if (method === 'GET' && url.pathname === '/text') {
      const docId = url.searchParams.get('docId') ?? '';
      const line = Number(url.searchParams.get('line'));
      const column = Number(url.searchParams.get('column') ?? '0');
      const file = resolveDocEntryPath(ctx, docId);
      if (!file) return json(res, 400, { error: 'invalid docId' });
      if (!Number.isInteger(line) || line < 1) return json(res, 400, { error: 'invalid line' });
      let source: string;
      try {
        source = await fs.readFile(file, 'utf8');
      } catch {
        return json(res, 404, { error: 'doc not found' });
      }
      const result = readRichText(
        source,
        line,
        Number.isInteger(column) ? column : 0,
        url.searchParams.get('text') ?? undefined,
      );
      if (!result.ok) return json(res, result.status, { error: result.error });
      return json(res, 200, { text: result.text, runs: result.runs, rich: result.rich });
    }
    if (method !== 'POST') return next();
    const requestCheck = validateMutationRequest(req, { requireJsonBody: true });
    if (!requestCheck.ok) return json(res, requestCheck.status, { error: requestCheck.error });

    try {
      if (url.pathname === '/') {
        const body = (await readBody(req)) as EditBody;
        const docId = body.docId ?? '';
        const file = resolveDocEntryPath(ctx, docId);
        if (!file) return json(res, 400, { error: 'invalid docId' });
        if (!body.line || body.line < 1) return json(res, 400, { error: 'invalid line' });
        if (!Array.isArray(body.ops)) return json(res, 400, { error: 'missing ops' });

        let source: string;
        try {
          source = await fs.readFile(file, 'utf8');
        } catch {
          return json(res, 404, { error: 'doc not found' });
        }

        const result = applyEdit(source, body.line, body.column ?? 0, body.ops);
        if (!result.ok) return json(res, result.status, { error: result.error });
        const changed = result.source !== source;
        if (changed) await fs.writeFile(file, result.source, 'utf8');
        return json(res, 200, { ok: true, changed });
      }

      if (url.pathname === '/revert-asset') {
        const body = (await readBody(req)) as { docId?: string; assetPath?: string };
        const docId = body.docId ?? '';
        const assetPath = body.assetPath;
        const file = resolveDocEntryPath(ctx, docId);
        if (!file) return json(res, 400, { error: 'invalid docId' });
        if (typeof assetPath !== 'string' || !assetPath) {
          return json(res, 400, { error: 'missing assetPath' });
        }
        if (!assetPath.startsWith('./assets/') && !assetPath.startsWith('@assets/')) {
          return json(res, 400, { error: 'asset path must start with ./assets/ or @assets/' });
        }

        let source: string;
        try {
          source = await fs.readFile(file, 'utf8');
        } catch {
          return json(res, 404, { error: 'doc not found' });
        }

        const result = applyRevertAsset(source, assetPath);
        if (!result.ok) return json(res, result.status, { error: result.error });
        const changed = result.source !== source;
        if (changed) await fs.writeFile(file, result.source, 'utf8');
        return json(res, 200, { ok: true, changed });
      }

      // One read-modify-write per batch so a multi-element edit session
      // lands as a single HMR. Per-edit failures are reported but don't
      // abort the batch.
      if (url.pathname === '/batch') {
        const body = (await readBody(req)) as EditBatchBody;
        const docId = body.docId ?? '';
        const file = resolveDocEntryPath(ctx, docId);
        if (!file) return json(res, 400, { error: 'invalid docId' });
        if (!Array.isArray(body.edits)) return json(res, 400, { error: 'missing edits' });

        let source: string;
        try {
          source = await fs.readFile(file, 'utf8');
        } catch {
          return json(res, 404, { error: 'doc not found' });
        }

        const original = source;
        const results: Array<{ ok: boolean; error?: string }> = [];
        for (const edit of body.edits) {
          if (!edit.line || edit.line < 1 || !Array.isArray(edit.ops)) {
            results.push({ ok: false, error: 'invalid edit' });
            continue;
          }
          const r = applyEdit(source, edit.line, edit.column ?? 0, edit.ops);
          if (r.ok) {
            source = r.source;
            results.push({ ok: true });
          } else {
            results.push({ ok: false, error: r.error });
          }
        }
        const changed = source !== original;
        if (changed) await fs.writeFile(file, source, 'utf8');
        return json(res, 200, { ok: true, changed, results });
      }

      return next();
    } catch (err) {
      json(res, 500, { error: String((err as Error).message ?? err) });
    }
  });
}
