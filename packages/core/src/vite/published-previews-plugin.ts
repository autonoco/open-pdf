import fs from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'vite';

const id = 'virtual:open-pdf/previews';

export function publishedPreviewsPlugin(directory: string): Plugin {
  const indexPath = path.join(directory, 'index.json');
  let serving = false;
  return {
    name: 'open-pdf:published-previews',
    configResolved(config) {
      serving = config.command === 'serve';
    },
    resolveId(source) {
      return source === id ? `\0${id}` : null;
    },
    async load(source) {
      if (source !== `\0${id}`) return null;
      if (serving) return 'export default {};';
      this.addWatchFile(indexPath);
      let raw: string;
      try {
        raw = await fs.readFile(indexPath, 'utf8');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return 'export default {};';
        throw error;
      }
      const index = JSON.parse(raw) as {
        version?: number;
        kind?: string;
        documents?: Array<{ id: string; thumbnail: string | null }>;
      };
      if (index.version !== 1 || index.kind !== 'pdfs' || !Array.isArray(index.documents))
        throw new Error('Invalid published preview index');
      const imports: string[] = [];
      const entries: string[] = [];
      const seen = new Set<string>();
      for (const [i, doc] of index.documents.entries()) {
        if (!doc || typeof doc.id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(doc.id))
          throw new Error('Invalid preview document id');
        if (seen.has(doc.id)) throw new Error(`Duplicate preview document id: ${doc.id}`);
        seen.add(doc.id);
        if (doc.thumbnail === null) {
          entries.push(`${JSON.stringify(doc.id)}: null`);
          continue;
        }
        if (typeof doc.thumbnail !== 'string' || !/^[a-f0-9]{64}\.png$/.test(doc.thumbnail))
          throw new Error('Invalid preview filename');
        const file = path.join(directory, doc.thumbnail);
        const info = await fs.lstat(file).catch((cause: unknown) => {
          throw new Error(`Cannot read preview for ${doc.id}: ${doc.thumbnail}`, { cause });
        });
        if (!info.isFile() || info.isSymbolicLink()) throw new Error('Invalid preview image');
        imports.push(`import image${i} from ${JSON.stringify(`${file}?url`)};`);
        entries.push(`${JSON.stringify(doc.id)}: image${i}`);
      }
      return `${imports.join('\n')}\nexport default {${entries.join(',')}};`;
    },
  };
}
