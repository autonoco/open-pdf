import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { loadConfigFromFile, normalizePath, type Plugin, type ViteDevServer } from 'vite';
import type { OpenPdfConfig } from '../config.ts';
import { DOC_ID_RE } from '../editing/doc-ops.ts';
import { hasRecentWrite } from './recent-writes.ts';

export type { OpenPdfConfig };

export type OpenPdfPluginOptions = {
  userCwd: string;
  config: OpenPdfConfig;
  coreVersion: string;
};

const CONFIG_FILE = 'open-pdf.config.ts';

const DOCS_VMOD = 'virtual:open-pdf/docs';
const CONFIG_VMOD = 'virtual:open-pdf/config';
const FOLDERS_VMOD = 'virtual:open-pdf/folders';

type FoldersManifest = {
  folders: unknown[];
  assignments: Record<string, string>;
};

async function readFoldersManifest(file: string): Promise<FoldersManifest> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw) as Partial<FoldersManifest>;
    return {
      folders: Array.isArray(parsed.folders) ? parsed.folders : [],
      assignments:
        parsed.assignments && typeof parsed.assignments === 'object'
          ? (parsed.assignments as Record<string, string>)
          : {},
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { folders: [], assignments: {} };
    }
    throw err;
  }
}

function resolved(id: string): string {
  return `\0${id}`;
}

async function findDocs(userCwd: string, docsDir: string): Promise<string[]> {
  const abs = path.resolve(userCwd, docsDir);
  if (!existsSync(abs)) return [];
  const hits = await fg('*/index.{tsx,jsx,ts,js}', {
    cwd: abs,
    absolute: true,
    onlyFiles: true,
  });
  return hits.sort();
}

function toId(absFile: string, docsRoot: string): string {
  const rel = path.relative(docsRoot, absFile);
  return rel.split(path.sep)[0];
}

const META_THEME_RE = /(?:^|[\s,{])theme\s*:\s*['"]([^'"]+)['"]/;
const META_CREATED_AT_RE = /(?:^|[\s,{])createdAt\s*:\s*['"]([^'"]+)['"]/;

type ExtractedMeta = { theme: string | null; createdAt: string | null };

function extractMeta(src: string): ExtractedMeta {
  const empty: ExtractedMeta = { theme: null, createdAt: null };
  const metaStart = src.search(/export\s+const\s+meta\b/);
  if (metaStart === -1) return empty;
  const eqIdx = src.indexOf('=', metaStart);
  if (eqIdx === -1) return empty;
  const openBrace = src.indexOf('{', eqIdx);
  if (openBrace === -1) return empty;
  let depth = 0;
  let closeBrace = -1;
  for (let i = openBrace; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        closeBrace = i;
        break;
      }
    }
  }
  if (closeBrace === -1) return empty;
  const body = src.slice(openBrace + 1, closeBrace);
  const themeMatch = body.match(META_THEME_RE);
  const createdAtMatch = body.match(META_CREATED_AT_RE);
  return {
    theme: themeMatch ? themeMatch[1] : null,
    createdAt: createdAtMatch ? createdAtMatch[1] : null,
  };
}

async function readDocMeta(abs: string): Promise<ExtractedMeta> {
  try {
    const src = await fs.readFile(abs, 'utf8');
    return extractMeta(src);
  } catch {
    return { theme: null, createdAt: null };
  }
}

function parseCreatedAtMs(iso: string | null): number | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
}

// Deduped across repeated virtual-module regenerations so dev HMR doesn't
// re-log the same ignored folder on every doc change.
const warnedInvalidDocIds = new Set<string>();

export async function generateDocsModule(
  files: string[],
  docsRoot: string,
  isDev: boolean,
): Promise<{ code: string; ignored: string[] }> {
  const scanned = await Promise.all(
    files.map(async (abs) => {
      const id = toId(abs, docsRoot);
      const importPath = isDev ? `@fs/${normalizePath(abs).replace(/^\/+/, '')}` : abs;
      const meta = await readDocMeta(abs);
      return { id, importPath, theme: meta.theme, createdAt: parseCreatedAtMs(meta.createdAt) };
    }),
  );

  // Discovery globs every `docs/*/index.*`, but a doc id is used in URLs,
  // filesystem paths, and the editing routes — all guarded by DOC_ID_RE. Drop
  // folders with an unusable id instead of listing them as docs that then fail
  // every folder/edit action; `load` warns about each ignored folder.
  const entries = scanned.filter((e) => DOC_ID_RE.test(e.id));
  const ignored = scanned.filter((e) => !DOC_ID_RE.test(e.id)).map((e) => e.id);

  const ids = JSON.stringify(entries.map((e) => e.id).sort());
  const themesMap: Record<string, string> = {};
  const createdAtMap: Record<string, number> = {};
  for (const e of entries) {
    if (e.theme) themesMap[e.id] = e.theme;
    if (e.createdAt !== null) createdAtMap[e.id] = e.createdAt;
  }
  const themesJson = JSON.stringify(themesMap);
  const createdAtJson = JSON.stringify(createdAtMap);
  const importTokens = JSON.stringify(Object.fromEntries(entries.map((e) => [e.id, 0])));
  const devRuntime = isDev
    ? `
const docImportTokens = ${importTokens};
if (import.meta.hot) {
  import.meta.hot.on('open-pdf:doc-changed', (data) => {
    const ids = Array.isArray(data?.docIds) ? data.docIds : data?.docId ? [data.docId] : [];
    const token = Date.now();
    for (const id of ids) {
      if (Object.prototype.hasOwnProperty.call(docImportTokens, id)) docImportTokens[id] = token;
    }
  });
}
`
    : '';
  const cases = entries
    .map((e) => {
      const importExpr = isDev
        ? `import(/* @vite-ignore */ import.meta.env.BASE_URL + ${JSON.stringify(`${e.importPath}?t=`)} + docImportTokens[${JSON.stringify(e.id)}])`
        : `import(${JSON.stringify(e.importPath)})`;
      return `    case ${JSON.stringify(e.id)}: return ${importExpr};`;
    })
    .join('\n');

  const urlCases = entries
    .map((e) => {
      const urlExpr = isDev
        ? `import.meta.env.BASE_URL + ${JSON.stringify(`${e.importPath}?t=`)} + docImportTokens[${JSON.stringify(e.id)}]`
        : `${JSON.stringify(e.importPath)}`;
      return `    case ${JSON.stringify(e.id)}: return ${urlExpr};`;
    })
    .join('\n');

  const code = `// virtual:open-pdf/docs — generated
export const docIds = ${ids};
export const docThemes = ${themesJson};
export const docCreatedAt = ${createdAtJson};
${devRuntime}

export async function loadDoc(id) {
  switch (id) {
${cases}
    default: throw new Error('Doc not found: ' + id);
  }
}

// Absolute-from-BASE_URL module URL with the live cache-bust token, so the
// render worker can import the same doc module the main thread just loaded.
export function docImportUrl(id) {
  switch (id) {
${urlCases}
    default: throw new Error('Doc not found: ' + id);
  }
}
`;
  return { code, ignored };
}

export function openPdfPlugin(opts: OpenPdfPluginOptions): Plugin {
  const { userCwd, config, coreVersion } = opts;
  const docsDir = config.docsDir ?? 'docs';
  const docsRoot = path.resolve(userCwd, docsDir);
  const foldersManifestPath = path.join(docsRoot, '.folders.json');

  let isDev = false;
  const docIdForEntry = (p: string): string | null => {
    const rel = path.relative(docsRoot, p);
    if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
    const parts = rel.split(path.sep);
    if (parts.length !== 2) return null;
    if (!/^index\.(tsx|jsx|ts|js)$/.test(parts[1])) return null;
    return parts[0];
  };
  let docChangeTimer: ReturnType<typeof setTimeout> | null = null;
  const pendingDocChanges = new Set<string>();
  const queueDocChanged = (server: ViteDevServer, id: string) => {
    pendingDocChanges.add(id);
    if (docChangeTimer) clearTimeout(docChangeTimer);
    docChangeTimer = setTimeout(() => {
      docChangeTimer = null;
      const mod = server.moduleGraph.getModuleById(resolved(DOCS_VMOD));
      if (mod) server.moduleGraph.invalidateModule(mod);
      const docIds = Array.from(pendingDocChanges);
      pendingDocChanges.clear();
      server.ws.send({
        type: 'custom',
        event: 'open-pdf:doc-changed',
        data: { docIds },
      });
    }, 100);
  };

  return {
    name: 'open-pdf',
    config(_c, env) {
      isDev = env.command === 'serve';
      return {
        server: { fs: { allow: [userCwd] } },
      };
    },
    resolveId(id) {
      if (id === DOCS_VMOD) return resolved(DOCS_VMOD);
      if (id === CONFIG_VMOD) return resolved(CONFIG_VMOD);
      if (id === FOLDERS_VMOD) return resolved(FOLDERS_VMOD);
      return null;
    },
    async load(id) {
      if (id === resolved(DOCS_VMOD)) {
        const files = await findDocs(userCwd, docsDir);
        const { code, ignored } = await generateDocsModule(files, docsRoot, isDev);
        for (const docId of ignored) {
          if (warnedInvalidDocIds.has(docId)) continue;
          warnedInvalidDocIds.add(docId);
          this.warn(
            `Ignoring doc folder "${docId}": doc ids must match ${DOC_ID_RE} (lowercase/uppercase letters, digits, "-", "_"). Rename the folder under "${docsDir}/" to a kebab-case id so it appears in the browser and can be moved into folders.`,
          );
        }
        return code;
      }
      if (id === resolved(CONFIG_VMOD)) {
        const userBuild = config.build ?? {};
        const buildResolved = isDev
          ? { showDocBrowser: true, showDocUi: true, allowHtmlDownload: true }
          : {
              showDocBrowser: userBuild.showDocBrowser ?? true,
              showDocUi: userBuild.showDocUi ?? true,
              allowHtmlDownload: userBuild.allowHtmlDownload ?? true,
            };
        const resolvedConfig = { ...config, build: buildResolved, version: coreVersion };
        return `export default ${JSON.stringify(resolvedConfig)};\n`;
      }
      if (id === resolved(FOLDERS_VMOD)) {
        const manifest = await readFoldersManifest(foldersManifestPath);
        return `export default ${JSON.stringify(manifest)};\n`;
      }
      return null;
    },
    handleHotUpdate(ctx) {
      const docId = docIdForEntry(ctx.file);
      if (!docId) return;
      // A speaker-note save writes the doc file itself. The notes plugin
      // records that write so we can recognise it here and skip the
      // `doc-changed` broadcast, which would otherwise bump the dev
      // cache-bust token and remount the doc canvas. Genuine source edits
      // are never recorded, so they keep full HMR behaviour.
      if (hasRecentWrite(ctx.file)) return [];
      queueDocChanged(ctx.server, docId);
      return [];
    },
    configureServer(server) {
      const isDocEntry = (p: string) => docIdForEntry(p) !== null;

      let reloadTimer: ReturnType<typeof setTimeout> | null = null;
      const reload = () => {
        if (reloadTimer) clearTimeout(reloadTimer);
        reloadTimer = setTimeout(() => {
          reloadTimer = null;
          const mod = server.moduleGraph.getModuleById(resolved(DOCS_VMOD));
          if (mod) server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: 'full-reload' });
        }, 150);
      };
      // Vite's `root` is the core app dir, so chokidar doesn't watch the
      // user's docs folder by default. Add it explicitly — and pass the
      // directory itself, since Vite sets `disableGlobbing: true` and would
      // otherwise treat a glob pattern as a literal path.
      let watchedRoot = docsRoot;
      while (!existsSync(watchedRoot)) {
        const parent = path.dirname(watchedRoot);
        if (parent === watchedRoot) break;
        watchedRoot = parent;
      }
      server.watcher.add(watchedRoot);
      server.watcher.on('add', (p) => {
        if (isDocEntry(p)) reload();
      });
      server.watcher.on('addDir', (p) => {
        if (p === docsRoot && watchedRoot !== docsRoot) server.watcher.add(docsRoot);
        if (path.dirname(p) === docsRoot && DOC_ID_RE.test(path.basename(p))) reload();
      });
      server.watcher.on('unlink', (p) => {
        if (isDocEntry(p)) reload();
      });

      let foldersTimer: ReturnType<typeof setTimeout> | null = null;
      const invalidateFolders = () => {
        if (foldersTimer) clearTimeout(foldersTimer);
        foldersTimer = setTimeout(() => {
          foldersTimer = null;
          const mod = server.moduleGraph.getModuleById(resolved(FOLDERS_VMOD));
          if (mod) server.moduleGraph.invalidateModule(mod);
        }, 100);
      };
      // The docs directory watch covers this file, including its creation.
      // Explicitly watching the absent manifest can prevent chokidar from
      // discovering new doc directories on mounted filesystems.
      server.watcher.on('change', (p) => {
        if (p === foldersManifestPath) invalidateFolders();
      });
      server.watcher.on('add', (p) => {
        if (p === foldersManifestPath) invalidateFolders();
      });
      server.watcher.on('unlink', (p) => {
        if (p === foldersManifestPath) invalidateFolders();
      });
    },
  };
}

export async function loadUserConfig(userCwd: string): Promise<OpenPdfConfig> {
  const file = path.join(userCwd, CONFIG_FILE);
  if (!existsSync(file)) return {};
  const loaded = await loadConfigFromFile(
    { command: 'serve', mode: 'development' },
    file,
    userCwd,
    'silent',
  );
  return (loaded?.config ?? {}) as OpenPdfConfig;
}
