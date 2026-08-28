# @autono/open-pdf

Runtime and CLI for [open-pdf](https://openpdf.sh) — the PDF framework built for agents. Documents are React components; the dev server renders them to **real PDF bytes** on every save, so the preview you see in the browser is the file you ship.

## Install

Most workspaces get this installed by the scaffolder:

```bash
npm create @autono/open-pdf@latest my-docs
```

Use this package directly only when wiring up an existing workspace by hand:

```bash
pnpm add @autono/open-pdf
```

To update an existing workspace to the latest version (and sync its agent skills):

```bash
npx open-pdf update
```

## What's inside

- **Dev server + viewer** — renders actual PDF bytes (Takumi engine in a web worker) with sub-second re-renders on save. Doc list, page navigation, download.
- **Inspect mode** — press `i`, click any element on the page to see its exact source line and leave a comment. Comments persist as `@pdf-comment` markers in the source, ready for a coding agent to apply.
- **Vite plugin** — discovers `docs/<id>/index.tsx`, exposes docs via virtual modules, hot-reloads on add/remove.
- **Export CLI** — the same bytes as the preview, headless. `--format docx` produces an editable Word file (real text, not page images).
- **Agent skills** — file-based skills (`create-doc`, `apply-comments`, …) that sync into workspaces; no MCP server required.

## CLI

Once installed, the `open-pdf` bin is available in the workspace:

| Command | Description |
| --- | --- |
| `open-pdf dev` | Start the dev server. Flags: `-p, --port <port>`, `--host [host]`, `--open`, `--no-skills-check`. |
| `open-pdf build` | Build a static site. Flags: `--out-dir <dir>` (defaults to `dist`). |
| `open-pdf preview` | Preview the production build. Flags: `-p, --port <port>`, `--host [host]`, `--open`. |
| `open-pdf export [docs...]` | Render docs to files — PDF (same bytes as the preview) or editable DOCX. Flags: `--out-dir <dir>` (defaults to `export`), `--format <pdf\|docx>`. |
| `open-pdf sync:skills` | Sync built-in agent skills into this workspace. Flags: `--dry-run`. |
| `open-pdf update` | Update `@autono/open-pdf` to the latest version and sync skills. Flags: `--force`, `--no-skills`. |

## Authoring

A document is one folder under `docs/` with an `index.tsx` that default-exports a React component. Style with Tailwind via the `tw` prop; content flows and the engine paginates.

```tsx
import { PageNumber, TotalPages } from '@autono/open-pdf';
import type { PageOptions } from '@autono/open-pdf';

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 56, bottom: 72 },
  footer: (
    <span tw="flex w-full justify-end text-[10px]">
      Page <PageNumber /> of <TotalPages />
    </span>
  ),
};

export default function Doc() {
  return (
    <main tw="flex flex-col">
      <h1 tw="text-[30px] font-bold">Hello, open-pdf</h1>
      <p tw="mt-4">This paragraph is real PDF text.</p>
    </main>
  );
}

export const meta = { title: 'Hello' };
```

## Exports

```ts
import {
  PageNumber,        // resolved by the PDF engine in header/footer bands
  TotalPages,
  TargetPageNumber,
  type DocComponent,
  type DocMeta,
  type DocModule,
  type PageOptions,
  type PageFont,
  type PageMarginSide,
  type OpenPdfConfig,
} from '@autono/open-pdf';
```

The Vite plugin is exposed under a subpath for advanced setups:

```ts
import { createViteConfig } from '@autono/open-pdf/vite';
```

## Config

Create `open-pdf.config.ts` in the workspace root (all fields optional):

```ts
import type { OpenPdfConfig } from '@autono/open-pdf';

const openPdfConfig: OpenPdfConfig = {
  docsDir: 'docs',
  port: 5173,
  base: '/', // set to '/my-docs/' to host the built site under a subpath
};

export default openPdfConfig;
```

## Docs

Full documentation: [docs.openpdf.sh](https://docs.openpdf.sh)

## License

MIT
