import fs from 'node:fs/promises';
import path from 'node:path';
import type { ViteDevServer } from 'vite';
import { DOC_ID_RE } from '../../editing/doc-ops.ts';
import { validateMutationRequest } from '../../http/request-guard.ts';
import { listTemplates, templateEntry } from '../templates-plugin.ts';
import { type ApiContext, json, readBody } from './context.ts';

// GET  /__templates              list built-in templates
// POST /__templates/:id/use      copy a template into docs/ { docId? } -> { docId }

type UseTemplateBody = { docId?: unknown };

const CREATED_AT_RE = /(\bcreatedAt:\s*)(['"`])[^'"`]*\2/;

export async function createDocFromTemplate(
  docsRoot: string,
  templatesRoot: string,
  templateId: string,
  desiredId?: string,
  now: Date = new Date(),
): Promise<{ ok: true; docId: string } | { ok: false; status: number; error: string }> {
  if (!DOC_ID_RE.test(templateId)) return { ok: false, status: 400, error: 'invalid template' };
  let source: string;
  try {
    source = await fs.readFile(templateEntry(templatesRoot, templateId), 'utf8');
  } catch {
    return { ok: false, status: 404, error: 'template not found' };
  }

  const root = path.resolve(docsRoot);
  await fs.mkdir(root, { recursive: true });
  // mkdir without `recursive` fails with EEXIST, so it atomically claims the id.
  const reserve = (id: string) =>
    fs.mkdir(path.join(root, id)).then(
      () => true,
      (err: NodeJS.ErrnoException) => {
        if (err.code === 'EEXIST') return false;
        throw err;
      },
    );
  let docId: string;
  if (desiredId !== undefined) {
    if (!DOC_ID_RE.test(desiredId)) return { ok: false, status: 400, error: 'invalid docId' };
    if (!(await reserve(desiredId))) return { ok: false, status: 409, error: 'doc already exists' };
    docId = desiredId;
  } else {
    docId = templateId;
    for (let n = 2; !(await reserve(docId)); n++) docId = `${templateId}-${n}`;
  }

  const stamped = CREATED_AT_RE.test(source)
    ? source.replace(CREATED_AT_RE, `$1'${now.toISOString()}'`)
    : source;
  try {
    await fs.writeFile(path.join(root, docId, 'index.tsx'), stamped, { flag: 'wx' });
  } catch (err) {
    await fs.rm(path.join(root, docId), { recursive: true, force: true });
    throw err;
  }
  return { ok: true, docId };
}

export function registerTemplateRoutes(server: ViteDevServer, ctx: ApiContext): void {
  server.middlewares.use('/__templates', async (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://local');
    const method = req.method ?? 'GET';
    try {
      if (url.pathname === '/' && method === 'GET') {
        return json(res, 200, { templates: await listTemplates(ctx.templatesRoot) });
      }
      const useMatch = url.pathname.match(/^\/([^/]+)\/use$/);
      if (useMatch && method === 'POST') {
        const requestCheck = validateMutationRequest(req);
        if (!requestCheck.ok) return json(res, requestCheck.status, { error: requestCheck.error });
        const body = (await readBody(req)) as UseTemplateBody;
        if (body.docId !== undefined && typeof body.docId !== 'string') {
          return json(res, 400, { error: 'invalid docId' });
        }
        const created = await createDocFromTemplate(
          ctx.docsRoot,
          ctx.templatesRoot,
          useMatch[1],
          body.docId,
        );
        if (!created.ok) return json(res, created.status, { error: created.error });
        return json(res, 200, { ok: true, docId: created.docId });
      }
      return next();
    } catch (error) {
      return json(res, 500, { error: error instanceof Error ? error.message : String(error) });
    }
  });
}
