import fs from 'node:fs/promises';
import type { ViteDevServer } from 'vite';
import {
  DOC_ID_RE,
  duplicateDocDir,
  duplicateNotesElementInSource,
  duplicatePageInDefaultExportInSource,
  removeNotesElementInSource,
  removePageFromDefaultExportInSource,
  reorderDefaultExportPagesInSource,
  reorderNotesArrayInSource,
  resolveDocEntry,
  rmDocDir,
  updateMetaTitleInSource,
  validateDocName,
} from '../../editing/doc-ops.ts';
import { readManifest, writeManifest } from '../../files/folders.ts';
import { validateMutationRequest } from '../../http/request-guard.ts';
import { invalidateDocsRegistry } from '../open-pdf-plugin.ts';
import { type ApiContext, json, readBody } from './context.ts';

// PUT    /__docs/:id/reorder            reorder pages { order: number[] }
// DELETE /__docs/:id/pages/:i           remove page
// POST   /__docs/:id/pages/:i/duplicate duplicate page
// POST   /__docs/:id/duplicate          duplicate doc directory { newId? }
// PATCH  /__docs/:id                    rename doc (writes meta.title)
// DELETE /__docs/:id                    delete doc directory + folder assignment

type DuplicateDocBody = { newId?: unknown };
type DocPatchBody = { name?: unknown };

export function registerDocRoutes(server: ViteDevServer, ctx: ApiContext): void {
  server.middlewares.use('/__docs', async (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://local');
    const method = req.method ?? 'GET';

    try {
      const reorderMatch = url.pathname.match(/^\/([^/]+)\/reorder$/);
      if (reorderMatch && method === 'PUT') {
        const requestCheck = validateMutationRequest(req, { requireJsonBody: true });
        if (!requestCheck.ok) {
          return json(res, requestCheck.status, { error: requestCheck.error });
        }
        const docId = reorderMatch[1];
        if (!DOC_ID_RE.test(docId)) return json(res, 400, { error: 'invalid docId' });

        const body = (await readBody(req)) as { order?: unknown };
        if (!Array.isArray(body.order)) return json(res, 400, { error: 'invalid order' });
        const order: number[] = [];
        for (const v of body.order) {
          if (!Number.isInteger(v)) return json(res, 400, { error: 'invalid order' });
          order.push(v as number);
        }

        const entry = resolveDocEntry(ctx.docsRoot, docId);
        if (!entry) return json(res, 400, { error: 'invalid docId' });

        let source: string;
        try {
          source = await fs.readFile(entry, 'utf8');
        } catch {
          return json(res, 404, { error: 'doc not found' });
        }

        const reordered = reorderDefaultExportPagesInSource(source, order);
        if (reordered === null) {
          return json(res, 422, {
            error: 'could not reorder pages — order must be a permutation of the existing array',
          });
        }
        const withNotes = reorderNotesArrayInSource(reordered, order);
        if (withNotes === null) {
          return json(res, 422, {
            error: 'could not reorder pages — `notes` export has an unexpected shape',
          });
        }
        if (withNotes !== source) {
          await fs.writeFile(entry, withNotes, 'utf8');
        }
        return json(res, 200, { ok: true, docId, order });
      }

      const pageOpMatch = url.pathname.match(/^\/([^/]+)\/pages\/(\d+)(?:\/([a-z]+))?$/);
      if (pageOpMatch) {
        const docId = pageOpMatch[1];
        const pageIndex = Number.parseInt(pageOpMatch[2], 10);
        const op = pageOpMatch[3];
        if (!DOC_ID_RE.test(docId)) return json(res, 400, { error: 'invalid docId' });
        if (!Number.isInteger(pageIndex) || pageIndex < 0)
          return json(res, 400, { error: 'invalid page index' });

        const isDelete = method === 'DELETE' && !op;
        const isDuplicate = method === 'POST' && op === 'duplicate';
        if (!isDelete && !isDuplicate) return next();
        const requestCheck = validateMutationRequest(req);
        if (!requestCheck.ok) {
          return json(res, requestCheck.status, { error: requestCheck.error });
        }

        const entry = resolveDocEntry(ctx.docsRoot, docId);
        if (!entry) return json(res, 400, { error: 'invalid docId' });

        let source: string;
        try {
          source = await fs.readFile(entry, 'utf8');
        } catch {
          return json(res, 404, { error: 'doc not found' });
        }

        const updated = isDelete
          ? removePageFromDefaultExportInSource(source, pageIndex)
          : duplicatePageInDefaultExportInSource(source, pageIndex);
        if (updated === null) {
          return json(res, 422, {
            error: isDelete
              ? 'could not delete page — index out of range or default export is not an array'
              : 'could not duplicate page — index out of range or default export is not an array',
          });
        }
        const withNotes = isDelete
          ? removeNotesElementInSource(updated, pageIndex)
          : duplicateNotesElementInSource(updated, pageIndex);
        if (withNotes === null) {
          return json(res, 422, {
            error: isDelete
              ? 'could not delete page — `notes` export has an unexpected shape'
              : 'could not duplicate page — `notes` export has an unexpected shape',
          });
        }
        if (withNotes !== source) {
          await fs.writeFile(entry, withNotes, 'utf8');
        }
        return json(res, 200, { ok: true, docId, index: pageIndex });
      }

      const duplicateMatch = url.pathname.match(/^\/([^/]+)\/duplicate$/);
      if (duplicateMatch && method === 'POST') {
        const requestCheck = validateMutationRequest(req);
        if (!requestCheck.ok) {
          return json(res, requestCheck.status, { error: requestCheck.error });
        }
        const docId = duplicateMatch[1];
        if (!DOC_ID_RE.test(docId)) return json(res, 400, { error: 'invalid docId' });

        const body = (await readBody(req)) as DuplicateDocBody;
        if (body.newId !== undefined && typeof body.newId !== 'string') {
          return json(res, 400, { error: 'invalid newId' });
        }

        const duplicated = await duplicateDocDir(ctx.docsRoot, docId, body.newId);
        if (!duplicated.ok) return json(res, duplicated.status, { error: duplicated.error });

        const manifest = await readManifest(ctx.manifestPath);
        const folderId = manifest.assignments[docId];
        if (folderId) {
          manifest.assignments[duplicated.docId] = folderId;
          await writeManifest(ctx.manifestPath, manifest);
        }
        invalidateDocsRegistry(server);
        return json(res, 200, { ok: true, docId: duplicated.docId });
      }

      const idMatch = url.pathname.match(/^\/([^/]+)$/);
      if (!idMatch) return next();
      const docId = idMatch[1];
      if (!DOC_ID_RE.test(docId)) return json(res, 400, { error: 'invalid docId' });

      if (method === 'PATCH') {
        const requestCheck = validateMutationRequest(req, { requireJsonBody: true });
        if (!requestCheck.ok) {
          return json(res, requestCheck.status, { error: requestCheck.error });
        }
        const body = (await readBody(req)) as DocPatchBody;
        const name = validateDocName(body.name);
        if (!name) return json(res, 400, { error: 'invalid name' });

        const entry = resolveDocEntry(ctx.docsRoot, docId);
        if (!entry) return json(res, 400, { error: 'invalid docId' });

        let source: string;
        try {
          source = await fs.readFile(entry, 'utf8');
        } catch {
          return json(res, 404, { error: 'doc not found' });
        }

        const updated = updateMetaTitleInSource(source, name);
        if (updated === null) {
          return json(res, 422, {
            error: 'could not locate a safe place to write meta.title in index.tsx',
          });
        }
        if (updated !== source) {
          await fs.writeFile(entry, updated, 'utf8');
        }
        // The TSX edit lands through Vite's normal HMR pipeline, but the
        // React state holding `doc.meta` in the editor won't re-fetch on
        // its own — tell every client to refresh so the new title shows up.
        server.ws.send({ type: 'full-reload' });
        return json(res, 200, { ok: true, docId, name });
      }

      if (method === 'DELETE') {
        const requestCheck = validateMutationRequest(req);
        if (!requestCheck.ok) {
          return json(res, requestCheck.status, { error: requestCheck.error });
        }
        const removed = await rmDocDir(ctx.docsRoot, docId);
        if (!removed) return json(res, 404, { error: 'doc not found' });

        const manifest = await readManifest(ctx.manifestPath);
        delete manifest.assignments[docId];
        await writeManifest(ctx.manifestPath, manifest);
        invalidateDocsRegistry(server);
        return json(res, 200, { ok: true });
      }

      return next();
    } catch (err) {
      json(res, 500, { error: String((err as Error).message ?? err) });
    }
  });
}
