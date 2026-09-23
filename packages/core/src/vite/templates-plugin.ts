import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { normalizePath, type Plugin } from 'vite';

const TEMPLATES_VMOD = 'virtual:open-pdf/templates';
const RESOLVED_VMOD = `\0${TEMPLATES_VMOD}`;

export type TemplateMeta = {
  id: string;
  title: string;
  category: string;
};

const TITLE_RE = /\btitle:\s*(['"`])((?:\\.|(?!\1).)*)\1/;

export async function listTemplates(templatesRoot: string): Promise<TemplateMeta[]> {
  if (!existsSync(templatesRoot)) return [];
  const entries = await fg('*/index.tsx', { cwd: templatesRoot, onlyFiles: true });
  const metas = await Promise.all(
    entries.map(async (entry) => {
      const id = entry.split('/')[0];
      const source = await fs.readFile(path.join(templatesRoot, entry), 'utf8');
      const title = source.match(TITLE_RE)?.[2] ?? id;
      return { id, title, category: id.split('-')[0] };
    }),
  );
  return metas.sort((a, b) => a.id.localeCompare(b.id));
}

export function templateEntry(templatesRoot: string, id: string): string {
  return path.join(templatesRoot, id, 'index.tsx');
}

/**
 * Built-in starter templates that ship inside @autono/open-pdf. Dev-only: a
 * static build has nowhere to write a new doc, so it gets an empty registry.
 */
export function templatesPlugin(opts: { templatesRoot: string; pkgEntry: string }): Plugin {
  let isDev = false;
  return {
    name: 'open-pdf:templates',
    config(_c, env) {
      isDev = env.command === 'serve';
    },
    resolveId(id, importer) {
      if (id === TEMPLATES_VMOD) return RESOLVED_VMOD;
      // Templates import '@autono/open-pdf' like any doc, but they live inside
      // the package, where a bare self-import doesn't resolve.
      if (id === '@autono/open-pdf' && importer?.startsWith(opts.templatesRoot + path.sep)) {
        return opts.pkgEntry;
      }
      return null;
    },
    async load(id) {
      if (id !== RESOLVED_VMOD) return null;
      const templates = isDev ? await listTemplates(opts.templatesRoot) : [];
      const urls = Object.fromEntries(
        templates.map((t) => [
          t.id,
          `@fs/${normalizePath(templateEntry(opts.templatesRoot, t.id)).replace(/^\/+/, '')}`,
        ]),
      );
      return `// virtual:open-pdf/templates — generated
export const templates = ${JSON.stringify(templates)};
const urls = ${JSON.stringify(urls)};

export function templateImportUrl(id) {
  if (!(id in urls)) throw new Error('Template not found: ' + id);
  return import.meta.env.BASE_URL + urls[id];
}
`;
    },
  };
}
