import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const PKG_ROOT = path.resolve(import.meta.dirname, '..');
const { files } = JSON.parse(readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf8')) as {
  files: string[];
};

const shipped = (abs: string) =>
  files.some((entry) => {
    const rel = path.relative(path.join(PKG_ROOT, entry), abs);
    return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
  });

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((d) => d.isFile() && /\.(ts|tsx)$/.test(d.name) && !/\.test\.tsx?$/.test(d.name))
    .map((d) => path.join(d.parentPath, d.name));
}

// The app ships as source and Vite serves it from node_modules, so every
// relative import it makes must land inside a directory listed in `files`.
describe('published package', () => {
  it('ships every module the app source imports', () => {
    const missing: string[] = [];
    for (const file of sourceFiles(path.join(PKG_ROOT, 'src', 'app'))) {
      const source = readFileSync(file, 'utf8');
      for (const [, spec] of source.matchAll(/from\s+['"](\.{1,2}\/[^'"]+)['"]/g)) {
        const target = path.resolve(path.dirname(file), spec);
        if (!shipped(target)) missing.push(`${path.relative(PKG_ROOT, file)} -> ${spec}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
