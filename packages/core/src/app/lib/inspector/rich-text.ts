import type { JSONContent } from '@tiptap/core';
import type { RichTextRun } from './use-editor';

// A text element's content as the editor sees it: one paragraph of text
// nodes carrying inline marks, with hard breaks for `<br>`. Runs arrive
// from `GET /__edit/text` and travel back as `set-rich-text`.

export type RichStyle = Record<string, string>;

export function styleEquals(a: RichStyle | undefined, b: RichStyle | undefined): boolean {
  const ka = Object.keys(a ?? {});
  const kb = Object.keys(b ?? {});
  if (ka.length !== kb.length) return false;
  return ka.every((k) => a?.[k] === b?.[k]);
}

// Bold is one mark in the editor but 600, 700, 800, or 900 in the source.
// The weight rides on the textStyle mark so an untouched run keeps it;
// toggling bold on fresh text lands on 700.
function boldWeight(marks: NonNullable<JSONContent['marks']>): string {
  const carried = marks.find((m) => m.type === 'textStyle')?.attrs?.fontWeight;
  return typeof carried === 'string' && Number(carried) >= 600 ? carried : '700';
}

export function marksToStyle(marks: JSONContent['marks']): RichStyle {
  const style: RichStyle = {};
  const decorations: string[] = [];
  for (const mark of marks ?? []) {
    switch (mark.type) {
      case 'bold':
        style.fontWeight = boldWeight(marks ?? []);
        break;
      case 'italic':
        style.fontStyle = 'italic';
        break;
      case 'underline':
        decorations.push('underline');
        break;
      case 'strike':
        decorations.push('line-through');
        break;
      case 'textStyle': {
        const color = mark.attrs?.color;
        if (typeof color === 'string' && color) style.color = color;
        break;
      }
      case 'highlight': {
        const color = mark.attrs?.color;
        if (typeof color === 'string' && color) style.backgroundColor = color;
        break;
      }
    }
  }
  if (decorations.length > 0) style.textDecoration = decorations.join(' ');
  return style;
}

export function styleToMarks(style: RichStyle | undefined): NonNullable<JSONContent['marks']> {
  const marks: NonNullable<JSONContent['marks']> = [];
  if (!style) return marks;
  const weight = style.fontWeight && Number(style.fontWeight) >= 600 ? style.fontWeight : null;
  if (weight) marks.push({ type: 'bold' });
  if (style.fontStyle === 'italic') marks.push({ type: 'italic' });
  const decoration = style.textDecoration ?? '';
  if (decoration.includes('underline')) marks.push({ type: 'underline' });
  if (decoration.includes('line-through')) marks.push({ type: 'strike' });
  const textStyle: Record<string, string> = {};
  if (style.color) textStyle.color = style.color;
  if (weight && weight !== '700') textStyle.fontWeight = weight;
  if (Object.keys(textStyle).length > 0) marks.push({ type: 'textStyle', attrs: textStyle });
  if (style.backgroundColor)
    marks.push({ type: 'highlight', attrs: { color: style.backgroundColor } });
  return marks;
}

/** Adjacent runs with identical style fold into one; empty runs drop. */
export function mergeRuns(runs: RichTextRun[]): RichTextRun[] {
  const out: RichTextRun[] = [];
  for (const run of runs) {
    if (run.text === '') continue;
    const style = run.style && Object.keys(run.style).length > 0 ? run.style : undefined;
    const last = out[out.length - 1];
    if (last && styleEquals(last.style, style)) {
      last.text += run.text;
    } else {
      out.push(style ? { text: run.text, style } : { text: run.text });
    }
  }
  return out;
}

export function docToRuns(doc: JSONContent): RichTextRun[] {
  const runs: RichTextRun[] = [];
  const walk = (node: JSONContent) => {
    if (node.type === 'text') {
      runs.push({ text: node.text ?? '', style: marksToStyle(node.marks) });
      return;
    }
    if (node.type === 'hardBreak') {
      runs.push({ text: '\n' });
      return;
    }
    const children = node.content ?? [];
    children.forEach((child, i) => {
      if (i > 0 && node.type === 'doc') runs.push({ text: '\n' });
      walk(child);
    });
  };
  walk(doc);
  return mergeRuns(runs);
}

export function runsToDoc(runs: RichTextRun[]): JSONContent {
  const content: JSONContent[] = [];
  for (const run of runs) {
    const marks = styleToMarks(run.style);
    const lines = run.text.split('\n');
    lines.forEach((line, i) => {
      if (i > 0) content.push({ type: 'hardBreak' });
      if (line)
        content.push(
          marks.length > 0 ? { type: 'text', text: line, marks } : { type: 'text', text: line },
        );
    });
  }
  return { type: 'doc', content: [{ type: 'paragraph', content }] };
}

export function runsText(runs: RichTextRun[]): string {
  return runs.map((r) => r.text).join('');
}

export function runsHaveStyle(runs: RichTextRun[]): boolean {
  return runs.some((r) => r.style && Object.keys(r.style).length > 0);
}
