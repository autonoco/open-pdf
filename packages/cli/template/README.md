# open-pdf workspace

Docs as React components. Each doc lives under `docs/<id>/index.tsx` and default-exports an array of page components. The `@autono/open-pdf` runtime handles layout, scaling, navigation, thumbnails, and fullscreen play mode — you just write the pages.

## Getting started

```bash
pnpm install
pnpm dev
```

Then open the dev server and edit `docs/getting-started/index.tsx`, or create a new doc at `docs/<your-doc>/index.tsx`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server with hot reload. |
| `pnpm build` | Build a static bundle you can deploy. |
| `pnpm preview` | Preview the built bundle locally. |
| `pnpm export` | Render docs to PDF (or `--format docx`). |
| `pnpm update` | Update `@autono/open-pdf` to the latest version and sync skills. |

## Authoring a doc

```tsx
// docs/my-doc/index.tsx
import type { Page, DocMeta } from '@autono/open-pdf';

const Cover: Page = () => (
  <div style={{ width: '100%', height: '100%' }}>Hello</div>
);

export const meta: DocMeta = { title: 'My doc' };
export default [Cover] satisfies Page[];
```

Every page renders into a fixed **1920 × 1080** canvas — design with absolute pixel values. Put images, videos, and fonts under `docs/<id>/assets/` and import them directly.

See [`CLAUDE.md`](./CLAUDE.md) for the full authoring guide.

## Navigation

- Arrow keys / PageUp / PageDown move between pages.
- `F` enters fullscreen play mode; Esc exits.
- In play mode: Space / → next, ← prev.

## Claude Code integration

This workspace ships with Claude Code skills preconfigured under `.claude/skills/` and `.agents/skills/`. Ask Claude Code to "make docs about X" and the `create-doc` skill takes over. Use `apply-comments` to iterate via inspector-style markers inside your source.

## Config

Optional `open-pdf.config.ts` at the workspace root:

```ts
import type { OpenPdfConfig } from '@autono/open-pdf';

const openPdfConfig: OpenPdfConfig = {
  port: 5173,
};

export default openPdfConfig;
```

Supported fields: `docsDir`, `port`.
