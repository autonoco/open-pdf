---
name: doc-authoring
description: Technical reference for writing or editing open-pdf documents — file contract, the Takumi JSX dialect (`tw` prop), page geometry and margins, print type scale, tables, pagination control, running headers/footers with page counters, and known engine pitfalls. Consult this whenever you are about to write or modify any file under `docs/<id>/`, including from inside the `create-doc` or `apply-comments` workflows, or for any ad-hoc doc edit. Triggers on phrases like "edit the doc", "fix the layout", "change the palette", "add a section", "make a table", "page break", "investigate the doc framework", "how do docs work here".
---

# Authoring open-pdf documents

This skill is the **technical reference** for everything that happens inside `docs/<id>/index.tsx`. It does not own a workflow:

- `create-doc` owns "draft a new document" — it asks the user scoping questions, then delegates the *how* to this skill.
- `apply-comments` owns "process inspector markers" — it finds markers and applies edits, but the edits themselves follow the rules here.
- `current-doc` resolves deictic references ("this doc", "this element") to a concrete `docId` + selection. Consult it **first** when the user references the current doc without naming it, then come back here for how to edit it.
- Any ad-hoc doc edit (manual tweak, one-off fix) should also consult this skill before touching the file.

A document here is not a web page and not a slide: it renders to a **real PDF** — the preview in the browser is the same bytes a reader downloads. Content flows top to bottom and the engine paginates it. Your job is flowing, print-shaped content; the engine's job is pages.

## Topic references

Details live under `references/` in this skill. **Read the relevant file before using the feature**:

| Topic | Read before | File |
| --- | --- | --- |
| Tables | any tabular data — line items, comparisons, schedules | `references/tables.md` |
| Pagination control | hard page starts, keep-together blocks, multi-section docs | `references/pagination.md` |
| Page counters + running bands | any header/footer, "Page N of M" | `references/page-numbers.md` |
| Fonts + assets | anything beyond the bundled default font, images | `references/fonts-and-assets.md` |

## Hard rules

- Put the doc under `docs/<kebab-case-id>/`.
- Entry is `docs/<id>/index.tsx`.
- Do **not** touch `package.json`, `open-pdf.config.ts`, or other docs.
- Do not add dependencies. Only `react`, `@autono/open-pdf`, and plain JS are available.
- A doc is **one `index.tsx` plus `docs/<id>/assets/`** for its images/fonts — helper components and constants go inside the tsx. No other sibling files, no `README.md`, no CSS files.
- Components must be **pure and synchronous**: no hooks, no state, no `window`/`document`, no `fetch`. The doc renders in a worker to static PDF bytes — anything dynamic has nowhere to run.

## File contract

```tsx
// docs/<id>/index.tsx
import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Q3 Services Agreement',
  createdAt: '2026-08-18T12:00:00Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',                                       // or 'letter', 'legal', …
  margin: { top: 56, right: 64, bottom: 72, left: 64 },
  footer: (
    <div tw="flex w-full justify-center text-[9px] text-slate-400">
      <span tw="flex">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

export default function Document() {
  return (
    <main tw="flex flex-col text-[12px] leading-relaxed text-slate-800">
      {/* flowing content */}
    </main>
  );
}
```

- `export default` is **one zero-prop React component** — the whole document as flowing content. Not an array, not one component per page.
- `pageOptions` (optional) sets page size, margins, and running `header`/`footer` bands. Defaults: `a4`, 48px margins, no bands. **Margin values are numbers (CSS px) or `'auto'` — never CSS length strings** (`'1cm'` fails the render). A side set to `'auto'` sizes itself to fit that side's band. Page counters (`<PageNumber/>`, `<TotalPages/>`) only work inside the bands — see `references/page-numbers.md`.
- `meta.title` (optional) shows in the doc header and browser tab. Default is the folder name.
- `meta.theme` (optional) marks the doc as built from a theme under `themes/`. The id must match a `<id>.md` basename. Omit if not derived from a registered theme.
- `meta.createdAt` is an **ISO 8601 string literal** set once when the doc is scaffolded — **immediately before writing the file, run `node -e "console.log(new Date().toISOString())"` via Bash and paste the exact output**. Must stay a plain string literal (the framework reads it via regex, never by evaluating the module).

## The dialect: HTML-shaped JSX + `tw`

Write the HTML you already know — `div`, `span`, `p`, `h1`–`h3`, `table`, `ul`/`li`, `main`, `section` — styled with **Tailwind utilities via the `tw` prop**:

```tsx
<div tw="mt-6 flex items-baseline justify-between border-b border-slate-200 pb-2">
  <h2 tw="text-[18px] font-bold text-slate-900">Deliverables</h2>
  <span tw="text-[10px] uppercase tracking-widest text-slate-400">Section 2</span>
</div>
```

- `tw`, not `className` — `className` is silently stripped.
- Use `style={{ … }}` for the handful of properties Tailwind can't express or that read better inline: `{ breakBefore: 'page' }`, `{ breakInside: 'avoid' }`.
- Arbitrary values are the norm for print sizing: `text-[11px]`, `w-[260px]`, `p-[6px]`.
- Bare strings and numbers are valid children anywhere — no wrapper element needed.
- Inline `<svg>` elements render as vector paths — fine for rules, marks, and simple charts.

## Page geometry and the print type scale

Sizes are CSS pixels at 96 dpi; an A4 page is **794 × 1123 px** inside which your margins carve the text column. With the starter margins above you have roughly **666 px of width** — design for that column.

| Element | Size |
| --- | --- |
| Document title | 24–34px |
| Section heading | 15–20px |
| Body text | 11–13px |
| Table body / dense data | 10–11px |
| Caption, legal, footer band | 8–10px |

- Line-height: 1.3–1.4 for headings, 1.4–1.7 for body.
- One document = one palette (1 text color, 1 muted, 1 accent, 1 rule/border tint) and the engine's default font unless a theme says otherwise (`references/fonts-and-assets.md`).
- Space between blocks: `mt-4` to `mt-10`. Generous white space reads as professional print; cramped reads as a form letter.

**There is no vertical budget.** Content flows and the engine adds pages. What you control is *where* breaks happen — read `references/pagination.md` before writing any doc longer than a page.

## Engine pitfalls (encountered on real documents — avoid, don't rediscover)

1. **No explicit widths on `<th>`.** `tw="w-[45%]"` on a header cell leaves an unpainted gap in the header row's background. Let the table size its own tracks; put width hints on `<td>` content instead if you must.
2. **`breakInside: 'avoid'` on `<tr>` is unreliable inside flex wrappers.** If the table's ancestor chain includes a flex container, a tall row can still split across pages. Keep row content short (one title line + one detail line), and don't build load-bearing keep-together logic around table rows.
3. **No CSS grid layouts for structure you could express as a table.** Real `<table>` markup gets you column tracks, repeated `<thead>` on every page, and correct breaks. Hand-rolled flex/grid tables get none of that.
4. **Missing glyphs fail the render** (an error, not a blank). Stick to Latin text, common punctuation, and standard symbols unless a registered font covers your script (`references/fonts-and-assets.md`).

## Data rows vs designed repeats

- **Tabular data belongs in a `.map` over a data array** — invoice line items, schedules, roster rows. Put the data in a typed const at the top of the file; keep the row JSX in the map body. This is the one shape where a shared source location is correct: a comment on any row means "this row template".
- **Designed repeats (feature cards, testimonial blocks, KPI tiles) are explicit instances** of a small helper component defined in the same file — one JSX call per item, data as props. The inspector targets source JSX; explicit instances give each card its own address, so "make the middle one green" is one edit, not three.

## Editing an existing doc

Locate the section first instead of reading the whole file:

```bash
grep -n 'tw="[^"]*text-\[1[5-9]px\]\|<h[12]' docs/<id>/index.tsx
```

Headings anchor sections; read the target range with `offset` + `limit`. Read the whole file when auditing palette or restructuring.

## Themes

If `themes/<id>.md` exists and the doc is meant to follow it, **the theme file overrides the defaults in this skill** — its palette, typography, and fixed components are authoritative. Read the theme before applying anything else here. Themes are produced by the `create-theme` skill.

**Never apply a theme to a legal document** (contract, NDA, agreement, terms, policy, or any doc started from a `contract-*` template), even when asked to restyle "all docs". Keep its classic typesetting and leave `meta.theme` unset. If a user explicitly asks to theme a contract, say why it's excluded and confirm before doing anything.

## Runtime behavior you get for free

- Home page lists every folder under `docs/`; cards show a live first-page preview.
- The doc view renders the actual PDF: page scroll, thumbnail rail, page count and render time in the toolbar, **Download** (a clean render of the same document, without inspector metadata).
- **Inspect mode** (toolbar button or `i`): the user clicks any element on the PDF, sees its source location, and can leave a comment that lands in your source as an `@pdf-comment` marker (see `apply-comments`). The current selection is always in `node_modules/.open-pdf/current.json` (see `current-doc`).
- Hot reload: save `index.tsx` and the PDF re-renders in well under half a second.

## Self-review before finishing

- [ ] `docs/<id>/index.tsx` default-exports **one** component; `meta` has `title` + fresh `createdAt` literal.
- [ ] `pageOptions` declares size, margins, and a footer band with `<PageNumber/> of <TotalPages/>` for any doc over ~2 pages.
- [ ] Preview it: open `http://localhost:5173/s/<id>` (or ask the user to). No render error banner; page breaks fall between sections, not mid-heading.
- [ ] Every `tw` value is Tailwind the engine understands; nothing uses `className`.
- [ ] Tables are real `<table>` markup; no explicit widths on `<th>`.
- [ ] Sections that must start fresh use `breakBefore: 'page'`; blocks that must not straddle pages (signature block, totals) use `breakInside: 'avoid'` on a non-table-row element.
- [ ] One coherent palette and type scale across the whole document.
- [ ] Designed repeats are explicit component instances; data rows are a `.map` over a typed const.
- [ ] No hooks, no browser APIs, no non-Latin glyphs without a covering font.
- [ ] Nothing outside `docs/<id>/` was edited.

## Anti-patterns

- ❌ An array of page components, fixed page `<div>`s sized to the paper, or any "slide" thinking. Content flows; the engine paginates.
- ❌ `className`, external CSS, `<style>` blocks. `tw` + inline `style` only.
- ❌ Hand-rolled flex tables for tabular data — you lose repeated headers and column tracks.
- ❌ Explicit widths on `<th>` (engine paint bug).
- ❌ Web-scale typography (16px+ body). Print body is 11–13px.
- ❌ Hooks, state, event handlers, `Date.now()` in render — the output is static bytes.
- ❌ Screens of unbroken body text — break long docs into headed sections; use tables, key-value rows, and callout boxes for structure.
- ❌ Hardcoded page numbers in content, or `<PageNumber/>` outside a header/footer band.
- ❌ Installing packages, sibling files, editing `package.json`/config/other docs.
