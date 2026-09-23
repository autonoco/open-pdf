// Word and Markdown export from a doc's node tree. Shared by the export CLI
// (Node) and the preview render worker (browser); environment-neutral.
import { fromJsx } from '@takumi-rs/helpers/jsx';
import type { TakumiNode } from '../shared/takumi-doc.ts';
import { type DocxOptions, docxFromNodeTree } from './docx.ts';
import { markdownFromNodeTree } from './markdown.ts';

export type EditableFormat = 'docx' | 'md';

export const EDITABLE_FORMATS: readonly EditableFormat[] = ['docx', 'md'];

export const FORMAT_MIME: Record<'pdf' | EditableFormat, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  md: 'text/markdown',
};

export type EditableInput = {
  node: TakumiNode;
  title: string;
  pageOptions: NonNullable<DocxOptions['pageOptions']>;
  images: Map<string, Uint8Array>;
};

const bandNode = async (band: unknown) =>
  band ? ((await fromJsx(band as Parameters<typeof fromJsx>[0])).node as TakumiNode) : null;

export async function exportEditable(
  format: EditableFormat,
  input: EditableInput,
): Promise<{ bytes: Uint8Array; warnings: string[] }> {
  if (format === 'md') {
    const md = markdownFromNodeTree(input.node, { images: input.images });
    return { bytes: new TextEncoder().encode(md), warnings: [] };
  }
  return docxFromNodeTree(input.node, {
    title: input.title,
    pageOptions: input.pageOptions,
    headerNode: await bandNode(input.pageOptions.header),
    footerNode: await bandNode(input.pageOptions.footer),
    images: input.images,
  });
}
