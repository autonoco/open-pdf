import { isValidElement, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { insetBands } from './takumi-doc';

const paddingOf = (band: unknown) => {
  expect(isValidElement(band)).toBe(true);
  const { style } = (band as ReactElement<{ style: Record<string, unknown> }>).props;
  return [style.paddingLeft, style.paddingRight];
};

describe('insetBands', () => {
  it('insets bands by per-side left/right margins', () => {
    const out = insetBands({ margin: { left: 64, right: 72 }, header: 'h', footer: 'f' });
    expect(paddingOf(out.header)).toEqual([64, 72]);
    expect(paddingOf(out.footer)).toEqual([64, 72]);
  });

  it('uses a uniform margin, and the default when none is set', () => {
    expect(paddingOf(insetBands({ margin: 30, header: 'h' }).header)).toEqual([30, 30]);
    expect(paddingOf(insetBands({ header: 'h' }).header)).toEqual([48, 48]);
  });

  it("falls back to the engine floor for 'auto' sides", () => {
    const out = insetBands({ margin: { left: 'auto' }, header: 'h' });
    expect(paddingOf(out.header)).toEqual([37.8, 37.8]);
  });

  it('leaves missing bands alone', () => {
    const out = insetBands<{ margin: number; header?: unknown; footer?: unknown }>({ margin: 40 });
    expect(out.header).toBeUndefined();
    expect(out.footer).toBeUndefined();
  });
});
