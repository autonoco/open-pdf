import type { ServerResponse } from 'node:http';
import path from 'node:path';
import type { Connect } from 'vite';
import { DOC_ID_RE } from '../../editing/doc-ops.ts';

export type ApiContext = {
  userCwd: string;
  docsDir: string;
  docsRoot: string;
  globalAssetsRoot: string;
  manifestPath: string;
  templatesRoot: string;
  coreVersion: string;
};

export type ApiPluginOptions = {
  userCwd: string;
  docsDir?: string;
  assetsDir?: string;
  templatesRoot: string;
  coreVersion: string;
};

export function makeContext(opts: ApiPluginOptions): ApiContext {
  const userCwd = opts.userCwd;
  const docsDir = opts.docsDir ?? 'docs';
  const assetsDir = opts.assetsDir ?? 'assets';
  const docsRoot = path.resolve(userCwd, docsDir);
  const globalAssetsRoot = path.resolve(userCwd, assetsDir);
  const manifestPath = path.join(docsRoot, '.folders.json');
  return {
    userCwd,
    docsDir,
    docsRoot,
    globalAssetsRoot,
    manifestPath,
    templatesRoot: opts.templatesRoot,
    coreVersion: opts.coreVersion,
  };
}

export async function readBody(req: Connect.IncomingMessage): Promise<unknown> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

export function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
}

export function resolveDocPath(userCwd: string, docsDir: string, docId: string): string | null {
  if (!DOC_ID_RE.test(docId)) return null;
  const docsRoot = path.resolve(userCwd, docsDir);
  const full = path.resolve(docsRoot, docId, 'index.tsx');
  if (!full.startsWith(docsRoot + path.sep)) return null;
  return full;
}

export function resolveDocEntryPath(ctx: ApiContext, docId: string): string | null {
  return resolveDocPath(ctx.userCwd, ctx.docsDir, docId);
}
