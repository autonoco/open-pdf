# Tables

Real `<table>` markup is the only correct shape for tabular data. The engine
gives it column tracks (header and body cells align without manual width
math), **repeated `<thead>` on every page** a long table spans, and
break-aware row layout. A flex-and-div imitation gets none of that.

## Canonical pattern

```tsx
const items = [
  { sku: 'SVC-101', name: 'Discovery workshop', qty: 2, unit: 1850 },
  // …
];

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

<table tw="w-full border border-slate-300 text-[10.5px]">
  <thead>
    <tr tw="bg-slate-100 font-bold">
      <th tw="border-b border-slate-300 p-2 text-left">SKU</th>
      <th tw="border-b border-slate-300 p-2 text-left">Description</th>
      <th tw="border-b border-slate-300 p-2 text-right">Qty</th>
      <th tw="border-b border-slate-300 p-2 text-right">Amount</th>
    </tr>
  </thead>
  <tbody>
    {items.map((it) => (
      <tr key={it.sku}>
        <td tw="border-b border-slate-200 p-2 align-top">{it.sku}</td>
        <td tw="border-b border-slate-200 p-2 align-top">{it.name}</td>
        <td tw="border-b border-slate-200 p-2 text-right align-top">{String(it.qty)}</td>
        <td tw="border-b border-slate-200 p-2 text-right align-top">{money(it.qty * it.unit)}</td>
      </tr>
    ))}
  </tbody>
</table>
```

## Rules

- **Numeric columns right-align** (`text-right`), including their `<th>`.
  Money gets fixed decimals via `toLocaleString` so digits line up.
- **No explicit widths on `<th>`** (`w-[45%]` etc.) — a known engine bug
  leaves an unpainted notch in the header row's background fill. Column
  tracks size themselves from content; steer them by controlling cell
  content, not header widths. (A hairline seam can still appear at a
  column boundary even without widths — upstream paint quirk, cosmetic;
  don't fight it with markup.)
- **Row rules go on the cells, not the `<tr>`.** Borders on `<tr>` don't
  paint; put `border-b` on every `<td>`/`<th>` of the row. Row *backgrounds*
  (`bg-*` on `<tr>`) do paint.
- `align-top` on cells when any column can wrap to two lines.
- Two-line cells (title + muted detail) are a nested
  `<div tw="flex flex-col">` inside the `<td>` — keep the detail line short.
- **Don't rely on `breakInside: 'avoid'` on `<tr>`** — it is unreliable when
  the table sits inside a flex ancestor. Keep rows short instead; a row that
  can't fit twice on a page is a layout smell.
- Totals do **not** go in the table. Close the table, then a right-aligned
  summary block (`breakInside: 'avoid'` on that block is reliable):

```tsx
<div tw="mt-6 flex justify-end" style={{ breakInside: 'avoid' }}>
  <div tw="flex w-[260px] flex-col text-[11px]">
    <div tw="flex justify-between py-1">
      <span tw="text-slate-500">Subtotal</span>
      <span>{money(subtotal)}</span>
    </div>
    <div tw="flex justify-between py-2 text-[13px] font-bold text-slate-900">
      <span>Total due</span>
      <span>{money(total)}</span>
    </div>
  </div>
</div>
```

## Anti-patterns

- ❌ Flex rows pretending to be a table — headers drift from body columns and
  nothing repeats across pages.
- ❌ `w-[…]` on `<th>` (paint bug), or hand-balancing column widths at all.
- ❌ Left-aligned numbers, or floating-precision money (`$49.9`).
- ❌ A totals row inside `<tbody>` — it can strand on the next page alone.
- ❌ Giant cells with paragraphs of text — tables are for scannable data.
