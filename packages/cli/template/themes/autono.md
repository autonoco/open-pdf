---
name: Autono
description: Autono's brand in print — paper ground, obsidian ink, one near-black masthead, Monument Extended display type, and a single amber signal.
---

# Autono

Derived from the Autono Design System (design.autono.co). The screen brand is near-black with bone type; print inverts it to paper with obsidian ink so pages read and print cleanly, and keeps the near-black for one place only — the masthead on page one. Amber stays what it is on screen: a signal, used sparingly.

## Palette

| Role | Tailwind | Notes |
| --- | --- | --- |
| text | `text-[#070707]` | obsidian — titles, headings, key figures |
| body | `text-[#2a2724]` | graphite — running body copy |
| muted | `text-[#5a534d]` | stone-700 — labels, secondary copy, table detail lines |
| faint | `text-[#8a827a]` | stone-500 — running bands, captions only (too light for body) |
| accent | `text-[#8b6a31]` | amber-dim — section numbers, doc number, eyebrows on paper |
| signal | `bg-[#d4a04a]` / `border-[#d4a04a]` | amber — marks, 2px bars, the masthead eyebrow. Never as text on paper (fails contrast) |
| rule | `border-[#ece7dd]` | stone-100 hairline — row rules, dividers |
| rule-strong | `border-[#d4ccc0]` | stone-200 — table outer border, heading underline |
| band | `bg-[#fbf8f2]` | paper — table header fill, callout fill |
| masthead | `bg-[#070707]` + `text-[#f5f0e6]` | obsidian ground, bone type; muted text on it is `text-[#b8b0a5]` (stone-300) |

## Typography

Fonts are registered on `pageOptions.fonts` straight from the brand's hosted files (Monument and DM Sans from design.autono.co, JetBrains Mono from Google Fonts). Copy this array verbatim:

```tsx
fonts: [
  'https://design.autono.co/ds/fonts/DMSans-VariableFont.ttf',
  'https://design.autono.co/ds/fonts/PPMonumentExtended-Light.otf',
  'https://design.autono.co/ds/fonts/PPMonumentExtended-Regular.otf',
  'https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPQ.ttf',
],
```

Families are applied with inline `style`, via these constants (paste them at the top of the doc):

```tsx
const display = { fontFamily: 'PP Monument Extended' };
const sans = { fontFamily: 'DM Sans' };
const mono = { fontFamily: 'JetBrains Mono' };
```

- **PP Monument Extended** — display voice: document title, section headings, eyebrows, wordmark. It is very wide; keep titles short and sizes smaller than you would for a normal face.
- **DM Sans** — all body copy, table cells, key-value values. Set `style={sans}` on `<main>`.
- **JetBrains Mono** — meta: doc numbers, dates, table header labels, running bands, the section index number.

Type-scale overrides (everything else follows `doc-authoring` defaults):

- Document title: 26px Monument, `font-light leading-[1.1] tracking-[-0.035em]`
- Section heading: 14px Monument, `font-normal tracking-[-0.02em]`
- Eyebrow: 8px Monument, `uppercase tracking-[0.18em]`
- Meta / table header: 8.5px JetBrains Mono, `uppercase tracking-[0.08em]`
- Body: 11px DM Sans, `leading-[1.55]`
- Table body: 10.5px DM Sans

## Layout

- Page: `size: 'a4'`, margins `{ top: 56, right: 64, bottom: 72, left: 64 }`.
- The masthead opens page one; nothing sits above it.
- Section rhythm: `mt-10` between sections; each section starts with `SectionHeading` (mono index + Monument title + strong hairline).
- Radii: 2px (`rounded-[2px]`) on the masthead and callout; nothing else is rounded.
- Alignment: left-aligned copy; numbers right-aligned; key-value rows label-left, value-right.

## Fixed components

These are paste-ready Takumi-dialect JSX. Copy them verbatim into a doc that uses this theme, together with the `display` / `sans` / `mono` constants above.

### Masthead (page-one opener)

```tsx
const Masthead = ({
  eyebrow,
  title,
  meta,
}: {
  eyebrow: string;
  title: string;
  meta: { label: string; value: string }[];
}) => (
  <div tw="flex flex-col rounded-[2px] bg-[#070707] px-8 pb-7 pt-6 text-[#f5f0e6]">
    <div tw="flex items-center justify-between">
      <span tw="text-[11px] tracking-[0.04em]" style={display}>
        AUTONO
      </span>
      <span tw="text-[8px] uppercase tracking-[0.18em] text-[#d4a04a]" style={display}>
        {eyebrow}
      </span>
    </div>
    <h1 tw="mb-0 mt-10 text-[26px] font-light leading-[1.1] tracking-[-0.035em]" style={display}>
      {title}
    </h1>
    <div tw="mt-6 flex border-t border-[#3a3633] pt-3">
      {meta.map((m) => (
        <div key={m.label} tw="mr-10 flex flex-col">
          <span tw="text-[8px] uppercase tracking-[0.08em] text-[#8a827a]" style={mono}>
            {m.label}
          </span>
          <span tw="mt-1 text-[10.5px] text-[#f5f0e6]">{m.value}</span>
        </div>
      ))}
    </div>
  </div>
);
```

### Letterhead (for letters and short docs that skip the masthead)

```tsx
const Letterhead = ({ lines }: { lines: string[] }) => (
  <div tw="flex items-start justify-between border-b border-[#d4ccc0] pb-4">
    <div tw="flex flex-col">
      <span tw="text-[14px] tracking-[0.04em] text-[#070707]" style={display}>
        AUTONO
      </span>
      <span tw="mt-1 text-[9px] lowercase text-[#5a534d]" style={display}>
        the future is autonomous.
      </span>
    </div>
    <div tw="flex flex-col items-end text-[8.5px] uppercase tracking-[0.08em] text-[#5a534d]" style={mono}>
      {lines.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </div>
  </div>
);
```

### Section heading

```tsx
const SectionHeading = ({ index, title }: { index: string; title: string }) => (
  <div tw="flex items-baseline border-b border-[#d4ccc0] pb-2">
    <span tw="mr-3 text-[9px] text-[#8b6a31]" style={mono}>
      {index}
    </span>
    <h2 tw="m-0 text-[14px] font-normal tracking-[-0.02em] text-[#070707]" style={display}>
      {title}
    </h2>
  </div>
);
```

### Key-value row

```tsx
const KeyValue = ({ label, value }: { label: string; value: string }) => (
  <div tw="flex justify-between border-b border-[#ece7dd] py-1.5">
    <span tw="text-[#5a534d]">{label}</span>
    <span tw="font-medium text-[#070707]">{value}</span>
  </div>
);
```

### Table (header and cell classes)

```tsx
<table tw="w-full border border-[#d4ccc0] text-[10.5px]">
  <thead>
    <tr tw="bg-[#fbf8f2]">
      <th tw="border-b border-[#d4ccc0] px-3 py-2 text-left text-[8.5px] font-normal uppercase tracking-[0.08em] text-[#5a534d]" style={mono}>
        Phase
      </th>
      {/* numeric columns add text-right */}
    </tr>
  </thead>
  <tbody>
    {rows.map((r) => (
      <tr key={r.id}>
        <td tw="border-b border-[#ece7dd] px-3 py-2 align-top">{r.name}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### Callout

```tsx
const Callout = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div tw="mt-8 flex rounded-[2px] bg-[#fbf8f2]" style={{ breakInside: 'avoid' }}>
    <div tw="w-[2px] bg-[#d4a04a]" />
    <div tw="flex flex-col px-4 py-3 text-[10.5px] text-[#2a2724]">
      <span tw="text-[8px] uppercase tracking-[0.18em] text-[#8b6a31]" style={display}>
        {title}
      </span>
      <div tw="mt-1.5 flex flex-col">{children}</div>
    </div>
  </div>
);
```

### Footer band (goes in `pageOptions.footer`, not in content)

```tsx
footer: (
  <div tw="flex w-full items-center justify-between text-[8px] uppercase tracking-[0.08em] text-[#8a827a]" style={{ fontFamily: 'JetBrains Mono' }}>
    <span>Autono · {'<document title>'}</span>
    <span tw="flex">
      <PageNumber /> / <TotalPages />
    </span>
  </div>
),
```

## Aesthetic

Quiet, confident, a little mysterious — Autono's screen brand translated to paper. Paper ground and obsidian ink with generous white space; one near-black masthead per document as the only heavy surface; Monument Extended reserved for display moments and never used for body; JetBrains Mono for anything machine-adjacent (numbers, dates, labels, folios). Hairline rules only, 2px radii, no shadows, no gradients, no illustrations. Amber is a signal, not a palette: one eyebrow, one bar, one mark per view — and never amber text on paper (use amber-dim). Avoid a second accent color, colored table fills beyond paper, bold Monument, and anything that looks busy.

## Example usage

```tsx
<main tw="flex flex-col text-[11px] leading-[1.55] text-[#2a2724]" style={sans}>
  <Masthead
    eyebrow="Statement of Work"
    title="Autonomous Dispatch Pilot"
    meta={[
      { label: 'Client', value: 'Northwind Freight Co.' },
      { label: 'Ref', value: 'SOW-2026-014' },
    ]}
  />
  <div tw="mt-10 flex flex-col">
    <SectionHeading index="01" title="Overview" />
    {/* … */}
  </div>
</main>
```
