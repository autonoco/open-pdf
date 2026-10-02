---
name: create-doc
description: Use this skill when the user wants to create, draft, author, or generate a new document / PDF in this open-pdf repo. Triggers on phrases like "make a PDF about X", "draft an invoice", "create a proposal", "write up a report", "new doc", or when the user asks to add content under `docs/`. Do NOT use for editing the framework itself — only for authoring content inside `docs/<id>/`.
---

# Create a document in open-pdf

This skill owns the **workflow** for drafting a new document. The technical reference — file contract, the `tw` dialect, page geometry, tables, pagination, running bands — lives in the **`doc-authoring`** skill. Read that skill whenever you need details on *how* a document is structured. This skill assumes you'll consult it before writing code.

You only write files under `docs/<id>/`. Never modify `package.json`, `open-pdf.config.ts`, or existing docs.

## Step 1 — Pick a theme

**Legal documents never take a theme.** For a contract, NDA, agreement, terms, policy, or any doc started from a `contract-*` template, skip this step entirely: don't offer themes, don't set `meta.theme`, and keep the classic typesetting of the `contract-mutual-nda` template (Tinos serif, justified body, bold run-in clause headings, black ink). Brand palettes and display type undermine the formality readers expect from a legal document.

Otherwise, list files under `themes/`. If any theme markdown files exist (anything other than `README.md`), call `AskUserQuestion` with each theme id as an option plus a final **"no theme — design from scratch"** option. (`AskUserQuestion` holds at most 4 options — with 4+ themes, offer the 3 most topic-relevant plus "no theme"; the auto-added "Other" lets the user name any omitted theme.)

- If the user picks a theme: read `themes/<id>.md` end-to-end. The theme's palette, typography, and fixed components are now authoritative — copy them directly into the doc. **Also set `theme: '<theme-id>'` on the `meta` export** so the doc back-links to the theme. In Step 2, skip the **visual direction** question (the theme already commits to one); confirm the topic itself before moving on. Length and density are independent of theme — ask those normally.
- If the user picks "no theme", or `themes/` contains no theme markdown files: proceed to Step 2 unchanged.

If you skip the visual-direction question because a theme was picked, restate the theme name in Step 2 so the user can correct course before you start writing.

## Step 2 — Clarify requirements (MUST ask before writing code)

**Before writing any code, lock in the four key decisions below via `AskUserQuestion`.** They shape every downstream choice, so locking them in up front avoids rework. Only skip a question when it's already unambiguously answered — by the user's original message, or by a theme picked in Step 1 — and if you skip, restate your assumption so they can correct it.

**Topic comes first.** If the user's initial request is thin ("make me a PDF", "draft a doc"), make a *separate* `AskUserQuestion` call first to gather what the document is, who receives it, and any content they already have (line items, terms, data). Skip this only if already clear — then restate your reading so they can correct course.

Then ask these four in a single `AskUserQuestion` call (multi-question form):

1. **Visual direction** — propose 3 directions tailored to *this* document and its audience. Do **not** pull from a fixed preset list. Each option must combine a vibe word + a concrete visual cue (palette, weight, ruling) so the user can picture it; bare labels like "corporate" are too vague. The three options should feel meaningfully different.

   How options should shift with document type:
   - *Invoice for a logistics client* → **classic ledger** (near-black on white, hairline rules, tabular rigor) · **modern SaaS clean** (slate palette, soft table banding, one accent) · **bold brand-forward** (heavy display title, accent block header)
   - *Consulting proposal* → **confident editorial** (large serif-feel headings, generous margins) · **calm corporate** (single accent, restrained rules) · **data-forward** (KPI tiles and tables as the spine)
   - *Internal runbook* → **technical doc** (mono accents, numbered sections, tight tables) · **friendly field guide** (callout boxes, roomy line-height) · **compliance-formal** (dense, numbered clauses, footer legalese)

   Mark the best fit "(Recommended)". (`AskUserQuestion` auto-adds "Other" — don't add a catch-all yourself.)

2. **Length** — rough page count. Offer brackets: 1–2 (letter/invoice), 3–6 (proposal/report), 7–15 (long-form). The auto-added "Other" covers custom counts.
3. **Content density** — how packed is a page? Offer: airy (headings + short paragraphs, lots of white space), standard (sections with mixed prose/tables), dense (multi-column data, long tables, small type). This drives the type scale.
4. **Page setup** — offer: A4 with page-number footer (Recommended), Letter with page-number footer, or no running bands (single-page pieces). Running header (company name / confidentiality line) is a natural follow-up for contracts and reports.

After those four, ask follow-ups **only if still unclear**: brand colors, actual content data (names, amounts, dates, terms). Real documents live on real data — placeholder content like "Acme Corp, $1,000" is a last resort; prefer asking for the real values.

## Step 3 — Pick a doc id

Use **kebab-case**, short, descriptive. Examples: `invoice-harborline-0147`, `q3-services-proposal`, `onboarding-runbook`. Check `docs/` to avoid collisions.

## Step 4 — Plan the structure

Sketch the document as an ordered list of sections before writing code. Common shapes:

| Section | Purpose |
| --- | --- |
| Letterhead | Issuer identity, addressee block, doc number/date |
| Title block | Document title + one-line summary |
| Body sections | Headed prose, numbered clauses |
| Data table | Line items, schedules, comparisons |
| Totals / summary | Right-aligned money block, key figures |
| Callout box | Payment details, notes, warnings |
| Signature block | Names, titles, date lines |
| Footer band | Running page numbers, identity line |

**Rule of thumb:** structure over prose. If a paragraph is listing things, it wants to be a table or a key-value block.

Decide the page-break plan now (which sections get `breakBefore: 'page'`, which blocks get `breakInside: 'avoid'`) — `references/pagination.md` in `doc-authoring` has the per-document-shape defaults.

## Step 5 — Commit to a visual direction

One palette, one type scale, held for the whole document. The constraints (print type scale, palette structure, spacing) live in `doc-authoring` — apply them. Define the palette as plain consts or repeat Tailwind color utilities consistently (`slate-900`/`slate-500`/one accent). Fonts: default to the engine's bundled face; register custom fonts via `pageOptions.fonts` only when the user names one or supplies files (see `references/fonts-and-assets.md`).

## Step 6 — Write `docs/<id>/index.tsx`

Read the **`doc-authoring`** skill before writing — file contract, dialect, tables, pagination, page counters, and the engine pitfalls list. Its file-contract example is the starter template.

## Step 7 — Self-review

Run the checklist in `doc-authoring` ("Self-review before finishing").

## Step 8 — Hand off to the user

Tell the user:

- The doc id and file path you created.
- The preview URL — `http://localhost:5173/s/<id>` — hot-reloads on every edit, and the **Download** button hands them a clean render of the same document. For Word or Google Docs, `open-pdf export <id> --format docx` produces an editable .docx (drop it into Google Drive to convert it to a Google Doc).
- That they can hit **Inspect** (or `i`) in the preview, click any element, and leave comments — then ask you to run `apply-comments`.
- If dev isn't running: run the project's `dev` script from the project root with its package manager (`npm run dev`, `pnpm dev`, … — match the lockfile).

Don't run the dev server yourself unless asked.
