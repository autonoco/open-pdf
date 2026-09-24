// Serialize a Takumi node tree into GitHub-flavored Markdown: headings,
// paragraphs, lists, tables, emphasis, links and images. Environment-neutral.
// Layout (columns, colors, running bands) has no Markdown equivalent and is
// dropped; flex rows of inline items collapse onto one line.
import type { TakumiNode } from '../shared/takumi-doc.ts';

export type MarkdownOptions = {
  /** src -> image bytes. Known images are embedded as data URIs so the file stands alone. */
  images?: Map<string, Uint8Array>;
};

type Node = TakumiNode & {
  text?: string;
  tw?: string;
  className?: string;
};

const INLINE_TAGS = new Set(['span', 'a', 'b', 'strong', 'i', 'em', 'u', 'br', 'code']);

const BLOCK_TAGS = new Set([
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'div',
  'section',
  'main',
  'li',
  'td',
  'th',
  'blockquote',
]);

function isInline(node: Node): boolean {
  if (node.type === 'text') return !node.tagName || !BLOCK_TAGS.has(node.tagName);
  if (node.type === 'image') return true;
  if (!INLINE_TAGS.has(node.tagName ?? '')) return false;
  return (node.children ?? []).every(isInline);
}

// fromJsx collapses text-only elements into text nodes that keep their tag.
function childrenOf(node: Node): Node[] {
  if (node.type === 'text' && node.tagName) return [{ type: 'text', text: node.text ?? '' }];
  return node.children ?? [];
}

function mimeOf(bytes: Uint8Array): string {
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return 'image/png';
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg';
  if (bytes[0] === 0x47 && bytes[1] === 0x49) return 'image/gif';
  if (bytes[8] === 0x57 && bytes[9] === 0x45) return 'image/webp';
  return 'image/svg+xml';
}

function dataUri(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return `data:${mimeOf(bytes)};base64,${btoa(binary)}`;
}

const isBold = (node: Node) => /\bfont-(semibold|bold|extrabold|black)\b/.test(node.tw ?? '');

// `|` is escaped everywhere so text can sit inside a table cell unchanged.
const escapeText = (s: string) => s.replace(/([\\`*_[\]<>|])/g, '\\$1');
const escapeUrl = (s: string) =>
  s.replace(/[\s()|]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`);
const collapse = (s: string) => s.replace(/\s+/g, ' ');
const NUMBER_MARKER = /^\d+[.)]\s*/;
const BULLET_MARKER = /^(?:[•·▪◦–-]|\\\*)\s*/;

class MarkdownWriter {
  constructor(private opts: MarkdownOptions) {}

  inline(nodes: Node[]): string {
    let out = '';
    for (const node of nodes) out += this.inlineNode(node);
    return out;
  }

  private inlineNode(node: Node): string {
    if (node.type === 'text') {
      if (node.tagName === 'br') return '  \n';
      const text = escapeText(collapse(node.text ?? ''));
      const href = node.tagName === 'a' ? node.attributes?.href : undefined;
      if (href) return `[${text}](${escapeUrl(href)})`;
      return this.wrap(isBold(node) ? 'strong' : node.tagName, text);
    }
    if (node.type === 'image') return this.image(node);
    // Page counters only mean something inside paginated output.
    if (node.className === 'pageNumber' || node.className === 'totalPages') return '';
    if (node.tagName === 'br') return '  \n';
    const inner = this.inline(node.children ?? []);
    if (node.tagName === 'a') {
      const href = node.attributes?.href;
      return href ? `[${inner}](${escapeUrl(href)})` : inner;
    }
    const wrapped = this.wrap(node.tagName, inner);
    return isBold(node) && !inner.includes('**') ? this.wrap('strong', wrapped) : wrapped;
  }

  private wrap(tag: string | undefined, text: string): string {
    if (!text.trim()) return text;
    // Emphasis markers must hug the text, so keep surrounding spaces outside.
    const [, lead, body, trail] = text.match(/^(\s*)(.*?)(\s*)$/s) ?? ['', '', text, ''];
    if (tag === 'b' || tag === 'strong') return `${lead}**${body}**${trail}`;
    if (tag === 'i' || tag === 'em') return `${lead}*${body}*${trail}`;
    if (tag === 'code') return `${lead}\`${body}\`${trail}`;
    return text;
  }

  private image(node: Node): string {
    const src = node.src ?? '';
    if (!src || src.trimStart().startsWith('<')) return '';
    const alt = node.attributes?.alt ?? '';
    const bytes = this.opts.images?.get(src);
    return `![${escapeText(alt)}](${bytes ? dataUri(bytes) : escapeUrl(src)})`;
  }

  /** Block walk: returns Markdown blocks (joined by blank lines by the caller). */
  blocks(nodes: Node[]): string[] {
    const out: string[] = [];
    for (const node of nodes) out.push(...this.block(node));
    return out;
  }

  private line(nodes: Node[]): string {
    return this.inline(nodes).trim();
  }

  private block(node: Node): string[] {
    const tag = node.tagName ?? '';
    if (/^h[1-6]$/.test(tag)) {
      const text = this.line(childrenOf(node));
      return text ? [`${'#'.repeat(Number(tag[1]))} ${text}`] : [];
    }
    if (tag === 'table') return this.table(node);
    if (tag === 'ul' || tag === 'ol') {
      // Docs often draw their own marker inside the <li>; drop it so the
      // Markdown marker isn't doubled, and keep numbering if it was numbered.
      const raw = (node.children ?? []).map((li) => this.line(childrenOf(li)));
      const numbered = tag === 'ol' || (raw.length > 0 && raw.every((t) => NUMBER_MARKER.test(t)));
      const items = raw.map((text, i) => {
        const body = text.replace(NUMBER_MARKER, '').replace(BULLET_MARKER, '');
        return `${numbered ? `${i + 1}.` : '-'} ${body}`;
      });
      return items.length ? [items.join('\n')] : [];
    }
    if (tag === 'blockquote') {
      const inner = this.blocks(childrenOf(node)).join('\n\n');
      return inner ? [inner.replace(/^/gm, '> ')] : [];
    }
    if (tag === 'svg') return [];
    if (node.type === 'image') {
      const img = this.image(node);
      return img ? [img] : [];
    }
    if (tag === 'hr') return ['---'];

    const children = childrenOf(node);
    if (children.length === 0) return [];
    if (node.type === 'text' || children.every(isInline)) {
      const tw = node.tw ?? '';
      const isRow = tw.includes('flex') && !tw.includes('flex-col');
      if (tag === 'p' || isRow || node.type === 'text') {
        const parts = isRow
          ? children.map((c) => this.line([c])).filter(Boolean)
          : [this.line(children)];
        const text = parts.join(' · ');
        if (!text) return [];
        return [isBold(node) && !text.includes('**') ? this.wrap('strong', text) : text];
      }
      // A column of inline items is a run of short lines, e.g. an address.
      const lines = children.map((c) => this.line([c])).filter(Boolean);
      return lines.length ? [lines.join('  \n')] : [];
    }
    return this.blocks(children);
  }

  private table(node: Node): string[] {
    const rows: { cells: string[]; header: boolean }[] = [];
    const visit = (group: Node, header: boolean) => {
      for (const child of group.children ?? []) {
        if (child.tagName === 'tr') {
          const cells = (child.children ?? [])
            .filter((c) => c.tagName === 'th' || c.tagName === 'td')
            .map((c) => this.cell(c));
          const isHeader = header || (child.children ?? []).every((c) => c.tagName === 'th');
          rows.push({ cells, header: isHeader });
        } else if (child.tagName === 'thead') visit(child, true);
        else if (child.tagName === 'tbody' || child.tagName === 'tfoot') visit(child, false);
      }
    };
    visit(node, false);
    if (rows.length === 0) return [];

    const cols = Math.max(...rows.map((r) => r.cells.length));
    const pad = (cells: string[]) => Array.from({ length: cols }, (_, i) => cells[i] ?? '');
    const headerIndex = rows.findIndex((r) => r.header);
    const head = headerIndex === 0 ? rows.shift() : undefined;
    const headCells = head ? pad(head.cells) : Array.from({ length: cols }, () => '');
    const lines = [
      `| ${headCells.join(' | ')} |`,
      `| ${headCells.map(() => '---').join(' | ')} |`,
      ...rows.map((r) => `| ${pad(r.cells).join(' | ')} |`),
    ];
    return [lines.join('\n')];
  }

  private cell(cell: Node): string {
    const children = childrenOf(cell);
    const text = children.every(isInline)
      ? this.line(children)
      : this.blocks(children).join('<br>');
    return text.replace(/ {2}\n/g, '<br>').replace(/\n+/g, ' ');
  }
}

export function markdownFromNodeTree(root: TakumiNode, opts: MarkdownOptions = {}): string {
  const blocks = new MarkdownWriter(opts).blocks([root as Node]);
  return `${blocks.join('\n\n').trim()}\n`;
}
