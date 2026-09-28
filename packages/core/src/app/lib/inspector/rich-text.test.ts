import { describe, expect, it } from 'vitest';
import {
  docToRuns,
  marksToStyle,
  mergeRuns,
  runsHaveStyle,
  runsText,
  runsToDoc,
  styleToMarks,
} from './rich-text.ts';

describe('marks and styles', () => {
  it('maps editor marks onto the inline style keys the server accepts', () => {
    expect(
      marksToStyle([
        { type: 'bold' },
        { type: 'italic' },
        { type: 'underline' },
        { type: 'strike' },
        { type: 'textStyle', attrs: { color: '#ff0000' } },
        { type: 'highlight', attrs: { color: '#ffff00' } },
      ]),
    ).toEqual({
      fontWeight: '700',
      fontStyle: 'italic',
      textDecoration: 'underline line-through',
      color: '#ff0000',
      backgroundColor: '#ffff00',
    });
  });

  it('keeps a non-700 bold weight across the round trip', () => {
    const marks = styleToMarks({ fontWeight: '800' });
    expect(marks).toEqual([{ type: 'bold' }, { type: 'textStyle', attrs: { fontWeight: '800' } }]);
    expect(marksToStyle(marks)).toEqual({ fontWeight: '800' });
    expect(marksToStyle([{ type: 'bold' }])).toEqual({ fontWeight: '700' });
    expect(marksToStyle([{ type: 'textStyle', attrs: { fontWeight: '800' } }])).toEqual({});
  });

  it('round-trips a style through marks', () => {
    const style = {
      fontWeight: '700',
      fontStyle: 'italic',
      textDecoration: 'underline',
      color: '#123456',
    };
    expect(marksToStyle(styleToMarks(style))).toEqual(style);
    expect(styleToMarks({ fontWeight: '400' })).toEqual([]);
  });
});

describe('runs', () => {
  it('merges adjacent runs with the same style and drops empty ones', () => {
    expect(
      mergeRuns([
        { text: 'a', style: { fontWeight: '700' } },
        { text: 'b', style: { fontWeight: '700' } },
        { text: '' },
        { text: 'c' },
        { text: 'd', style: {} },
      ]),
    ).toEqual([{ text: 'ab', style: { fontWeight: '700' } }, { text: 'cd' }]);
  });

  it('reads a single-paragraph document into runs with breaks', () => {
    const runs = docToRuns({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello ' },
            { type: 'text', text: 'world', marks: [{ type: 'bold' }] },
            { type: 'hardBreak' },
            { type: 'text', text: 'again' },
          ],
        },
      ],
    });
    expect(runs).toEqual([
      { text: 'Hello ' },
      { text: 'world', style: { fontWeight: '700' } },
      { text: '\nagain' },
    ]);
    expect(runsText(runs)).toBe('Hello world\nagain');
    expect(runsHaveStyle(runs)).toBe(true);
  });

  it('builds a document the editor can load from runs', () => {
    const doc = runsToDoc([{ text: 'Hi\n' }, { text: 'there', style: { fontStyle: 'italic' } }]);
    expect(doc).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hi' },
            { type: 'hardBreak' },
            { type: 'text', text: 'there', marks: [{ type: 'italic' }] },
          ],
        },
      ],
    });
    expect(docToRuns(doc)).toEqual([
      { text: 'Hi\n' },
      { text: 'there', style: { fontStyle: 'italic' } },
    ]);
  });
});
