# open-pdf

**The PDF framework built for agents.**

[![npm](https://img.shields.io/npm/v/@autono/open-pdf?label=%40autono%2Fopen-pdf)](https://www.npmjs.com/package/@autono/open-pdf)
[![npm](https://img.shields.io/npm/v/@autono/create-open-pdf?label=%40autono%2Fcreate-open-pdf)](https://www.npmjs.com/package/@autono/create-open-pdf)
[![CI](https://github.com/autonoco/open-pdf/actions/workflows/ci.yml/badge.svg)](https://github.com/autonoco/open-pdf/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Your coding agent writes documents as React components. The dev server renders them to **real PDF bytes** on every save, so the preview in the browser is the file you ship. Click any element to see its source line and leave a comment; the agent applies it and re-renders. Export the same bytes headlessly as PDF, or as editable Word.

[openpdf.sh](https://openpdf.sh) · [Documentation](https://docs.openpdf.sh) · [Quickstart](https://docs.openpdf.sh/quickstart) · [Discussions](https://github.com/autonoco/open-pdf/discussions)

## Quick start

```bash
npm create @autono/open-pdf@latest my-docs
cd my-docs
npm run dev
```

Open the workspace in your coding agent and ask for a document. The bundled `create-doc` skill writes `docs/<id>/index.tsx`; the preview at `http://localhost:5173` updates on every save.

Requires Node.js 18+.

## Updating

Inside a workspace:

```bash
npx open-pdf update
```

Moves `@autono/open-pdf` to the latest version and syncs the agent skills it ships. Your docs and config are untouched. The dev server shows an **Update** button when a newer version is out, which does the same thing. Restart `npm run dev` afterwards.

## The loop

1. **Describe.** Tell your agent what the document is. It runs `/create-doc` and writes the React.
2. **Preview.** The dev server renders actual PDF bytes on every save, in well under a second.
3. **Annotate.** Press `i`, click anything, leave a note. It lands in the source as an `@pdf-comment` marker.
4. **Ship.** Your agent runs `/apply-comments`. `open-pdf export` writes the PDF, or `--format docx` for editable Word.

## What you get

- **A preview that is the PDF.** [Takumi](https://takumi.kane.tw) renders real PDF bytes in a web worker. No HTML approximation.
- **Click-to-source inspector.** Every element knows its exact source line. Comments persist in the source, ready for an agent.
- **Real document features.** HTML tables with repeating headers, page-break control, running header and footer bands, page numbers, custom fonts and images.
- **Export to PDF, Word, Google Docs.** DOCX output is real editable text, not page images.
- **Agent-native.** File-based skills (`create-doc`, `apply-comments`, `create-theme`, ...) sync into the workspace. No MCP server. Works with Claude Code, Cursor, Codex, Gemini CLI, OpenCode, Windsurf, Zed, and anything else that reads `AGENTS.md`.
- **Nothing to configure.** Vite, React, and TypeScript live inside the runtime. A workspace is `docs/`, an optional `open-pdf.config.ts`, and your agent skills.

## A document

```tsx
import { PageNumber, TotalPages, type PageOptions } from '@autono/open-pdf';

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

Style with Tailwind classes via the `tw` prop. Content flows and the engine paginates. See [Authoring](https://docs.openpdf.sh/authoring/documents) for tables, pagination, fonts, images, and themes.

## CLI

| Command | What it does |
| --- | --- |
| `open-pdf dev` | Dev server with live PDF preview and inspector. |
| `open-pdf build` | Static site of the viewer. |
| `open-pdf preview` | Serve the production build. |
| `open-pdf export [docs...]` | Render docs to `export/`. `--format pdf` (default) or `docx`. |
| `open-pdf sync:skills` | Sync the built-in agent skills into the workspace. |
| `open-pdf update` | Update `@autono/open-pdf` to the latest version and sync skills. |

Full flags: [CLI reference](https://docs.openpdf.sh/reference/cli) · [Config reference](https://docs.openpdf.sh/reference/config)

## Packages

| Package | Version | Role |
| --- | --- | --- |
| [`@autono/open-pdf`](packages/core) | [![npm](https://img.shields.io/npm/v/@autono/open-pdf)](https://www.npmjs.com/package/@autono/open-pdf) | Runtime: viewer, inspector, Vite plugin, `open-pdf` CLI. |
| [`@autono/create-open-pdf`](packages/cli) | [![npm](https://img.shields.io/npm/v/@autono/create-open-pdf)](https://www.npmjs.com/package/@autono/create-open-pdf) | `npm create @autono/open-pdf` scaffolder and workspace template. |
| [`apps/demo`](apps/demo) | private | Example workspace; the dogfood target for the framework. |
| [`apps/web`](apps/web) | private | [openpdf.sh](https://openpdf.sh) landing site. |
| [`docs/`](docs) | | [docs.openpdf.sh](https://docs.openpdf.sh), built with Mintlify. |

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the repo layout, dev workflow, and PR checklist.

```bash
pnpm install
pnpm dev:demo     # demo workspace against local core
pnpm check        # biome: format + lint
pnpm typecheck
pnpm test
```

Bugs and feature requests go through the [issue templates](https://github.com/autonoco/open-pdf/issues/new/choose). Questions and show-and-tell belong in [Discussions](https://github.com/autonoco/open-pdf/discussions). Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

Every merge to `main` is a release by default: CI tags the next version, publishes both packages to npm with provenance, and cuts a [GitHub Release](https://github.com/autonoco/open-pdf/releases). Merge commits containing `[skip release]` skip it.

## Security

Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md). Please do not open public issues for security reports.

## Acknowledgements

open-pdf started as a fork of [open-slide](https://github.com/1weiho/open-slide) by [Yiwei Ho](https://github.com/1weiho), keeping its agent-first architecture and retargeting it from slide decks to paginated PDFs. Rendering is powered by [Takumi](https://takumi.kane.tw).

## License

[MIT](LICENSE). Contains code from open-slide © 2026 Yiwei Ho; modifications © 2026 Autono Holdings Inc.
