# Page counters and running bands

Running headers/footers are **not** part of the flowing content — they are
declared on `pageOptions` and the engine paints them on every page, inside
the page margin. A margin side set to `'auto'` sizes itself to fit that
side's band; an explicit number is fixed, so **keep the band visibly
shorter than the declared margin** (a one-line 9px band fits comfortably in
the 56/72px margins used below).

```tsx
import { type PageOptions, PageNumber, TotalPages } from '@autono/open-pdf';

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 56, right: 64, bottom: 72, left: 64 },
  header: (
    <div tw="flex w-full items-center justify-between text-[9px] text-slate-400">
      <span>Meridian Systems LLC</span>
      <span>Confidential</span>
    </div>
  ),
  footer: (
    <div tw="flex w-full justify-center text-[9px] text-slate-400">
      <span tw="flex">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};
```

## Rules

- `<PageNumber />` and `<TotalPages />` are resolved by the engine at layout
  time (multi-pass, so totals are correct). They only mean something inside
  the `header` / `footer` bands — in body content they are undefined
  behavior. Never hardcode page numbers anywhere.
- Wrap counter text in an element with `tw="flex"` (as above) so the words
  and counters lay out on one line.
- Band root should be a full-width flex row (`tw="flex w-full …"`) —
  `justify-between` for corner pairs, `justify-center` for centered folios.
- Bands are automatically inset by the page's left/right margin, so they
  line up with the body column. Don't add horizontal padding to the band.
- Keep bands to one line at 8–10px. With explicit margins a too-tall band
  overlaps content (the margin does not grow to fit it); with `'auto'`
  margins it eats the text column on every page.
- `<TargetPageNumber />` (same import) resolves the page number of a link
  target — for table-of-contents entries pointing at anchors.

## Anti-patterns

- ❌ `Page 1 of 4` typed as literal text.
- ❌ Counters in body content.
- ❌ Repeating a "header" `<div>` at the top of each hand-made section as a
  fake running band.
- ❌ Multi-line footers with logos, addresses, disclaimers, and counters —
  pick two short things.
