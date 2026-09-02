# open-pdf — Agent Guide

You are authoring **documents** in this repo. Every doc is a React component that renders to a real PDF — HTML-shaped JSX styled with Tailwind via the `tw` prop; content flows and the engine paginates.

## Hard rules

- Put your doc under `docs/<kebab-case-id>/`.
- The entry is `docs/<id>/index.tsx`.
- A doc is one `index.tsx` plus `docs/<id>/assets/` for its images and fonts. Shared assets live in the root `assets/` folder (import via `@assets/...`).
- Do **not** touch `package.json`, `open-pdf.config.ts`, or other docs.
- Do not add dependencies. Use only `react` and standard web APIs.

## Which skill to use

- **Drafting a new document** — use the `create-doc` skill. It walks through scoping questions, structure, and hand-off.
- **Applying inspector comments** (`@pdf-comment` markers in a doc) — use the `apply-comments` skill.
- **Creating or extracting a theme** — use the `create-theme` skill. Themes live as markdown under `themes/<id>.md` and are read by `create-doc` before authoring.
- **Resolving "this page" / "this element"** — when the user references the current doc or selection without naming it, consult the `current-doc` skill. It reads the dev server's `node_modules/.open-pdf/current.json` to find which doc and inspector-picked element they mean.
- **Any other doc edit** — read the `doc-authoring` skill before writing. It is the technical reference for everything inside `docs/<id>/`: file contract, the `tw` dialect, page geometry, print type scale, tables, pagination, running bands, self-review checklist, and engine pitfalls. `create-doc` and `apply-comments` both defer to it for the *how*.

Keep this file short: hard rules only. All deeper guidance lives in the skills above.

## Updating skills

The skills above are managed by `@autono/open-pdf`. Do not edit them in place. To pull the latest versions:

```
pnpm run update
```

This moves `@autono/open-pdf` to the latest release and syncs the skills it ships (`pnpm sync:skills` alone re-syncs from the installed version). `pnpm dev` will also detect drift on startup and offer to sync. `pnpm sync:skills --dry-run` (via `pnpm exec open-pdf sync:skills --dry-run`) previews changes without writing.
