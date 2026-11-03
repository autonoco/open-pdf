# Pagination control

Content flows; the engine cuts it into pages, controls widows/orphans, and
repeats table headers. You never compute page fits — you declare *intent*
at the block level and let the engine satisfy it.

## The three tools

| Intent | Declaration | Where |
| --- | --- | --- |
| "This section starts on a fresh page" | `style={{ breakBefore: 'page' }}` | the section's wrapper element |
| "This block must not straddle a page break" | `style={{ breakInside: 'avoid' }}` | signature blocks, totals, callouts, figures |
| "Same on every page" | `pageOptions.header` / `pageOptions.footer` | module-level `pageOptions` |

```tsx
<div tw="flex flex-col" style={{ breakBefore: 'page' }}>
  <h2 tw="text-[18px] font-bold text-slate-900">Terms and Conditions</h2>
  {/* … */}
</div>
```

## What to declare, by document shape

- **Contract / proposal:** `breakBefore: 'page'` on each numbered top-level
  section; `breakInside: 'avoid'` on the signature block.
- **Invoice:** nothing before the table (let it flow); `breakInside: 'avoid'`
  on the totals block and the payment-details box so neither strands alone.
- **Report:** `breakBefore: 'page'` on chapters only. Do not force-break
  every heading — half-empty pages read worse than a heading at 70% depth
  (the engine already keeps a heading with its following lines).

## Caveats

- `breakBefore: 'avoid'` and `breakAfter: 'avoid'` are unsupported and fail
  rendering. To keep a heading and its following paragraph together, wrap them
  in a small block with `breakInside: 'avoid'`.

- `breakInside: 'avoid'` on **table rows** is unreliable when the table has a
  flex ancestor — see `tables.md`. It is reliable on ordinary block elements.
- A `breakInside: 'avoid'` block taller than one page has to split anyway.
  Keep protected blocks well under a page.
- The **first** element of the document must not carry `breakBefore: 'page'` —
  you'd ship a blank first page.

## Anti-patterns

- ❌ Manually sizing "page" `<div>`s to paper height. That is slide thinking;
  the output will drift the moment content changes.
- ❌ `breakBefore` on every heading — confetti pagination.
- ❌ Spacer `<div tw="h-[200px]">` stacks to push content to the next page —
  use `breakBefore: 'page'`.
- ❌ Wrapping the entire document in one `breakInside: 'avoid'`.
