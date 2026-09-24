// Serialize a Takumi node tree into a real, editable Word document (OOXML):
// paragraphs, styled runs, tables with repeating headers, images, running
// header/footer bands with live PAGE / NUMPAGES fields. Environment-neutral —
// callers supply image bytes; output is a zipped .docx as Uint8Array.
//
// Fidelity contract: structure and text are faithful; visual styling is a
// close approximation (Word is a different layout engine — that is the point
// of exporting to Word: the reader edits on).
import { zipSync } from 'fflate';
import type { TakumiNode } from '../shared/takumi-doc.ts';
import { inheritInline, type ResolvedStyle, resolveTw } from './tw-styles.ts';

export type DocxOptions = {
  title?: string;
  pageOptions?: {
    size?: string | { width: number; height: number };
    margin?: number | string | Record<string, number | string>;
    header?: unknown;
    footer?: unknown;
  };
  /** Header/footer bands as fromJsx node trees (counters keep their className markers). */
  headerNode?: TakumiNode | null;
  footerNode?: TakumiNode | null;
  /** src -> image bytes, for every <img> in the tree. */
  images?: Map<string, Uint8Array>;
};

// ── Unit conversions (CSS px at 96dpi) ──────────────────────────────────────
const pxToTwip = (px: number) => Math.round(px * 15);
const pxToHalfPt = (px: number) => Math.round(px * 1.5);
const pxToEmu = (px: number) => Math.round(px * 9525);

const PAGE_SIZES_TWIPS: Record<string, { w: number; h: number }> = {
  a4: { w: 11906, h: 16838 },
  letter: { w: 12240, h: 15840 },
  legal: { w: 12240, h: 20160 },
  a3: { w: 16838, h: 23811 },
  a5: { w: 8391, h: 11906 },
};

const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── Node classification ──────────────────────────────────────────────────────

type Ctx = ResolvedStyle;

const nodeStyle = (node: TakumiNode): ResolvedStyle =>
  resolveTw((node as { tw?: string }).tw, (node as { style?: Record<string, unknown> }).style);

function isInlineNode(node: TakumiNode): boolean {
  if (node.type === 'text') return true;
  if (node.type === 'image') return true;
  const tag = node.tagName ?? '';
  if (['span', 'a', 'b', 'strong', 'i', 'em', 'u', 'br'].includes(tag)) {
    return (node.children ?? []).every(isInlineNode);
  }
  return false;
}

function textContent(node: TakumiNode): string {
  if (node.type === 'text') return (node as { text?: string }).text ?? '';
  return (node.children ?? []).map(textContent).join('');
}

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

/** fromJsx collapses text-only elements into text nodes that keep their tag —
 *  give such nodes back a synthetic inline child so block logic can run. */
function inlineChildrenOf(node: TakumiNode): TakumiNode[] {
  if (node.type === 'text' && node.tagName) {
    return [
      {
        type: 'text',
        ...({ text: (node as { text?: string }).text ?? '' } as object),
      } as TakumiNode,
    ];
  }
  return node.children ?? [];
}

/** True when the node is a collapsed text element acting as a block. */
function isCollapsedBlock(node: TakumiNode): boolean {
  return node.type === 'text' && !!node.tagName && BLOCK_TAGS.has(node.tagName);
}

// ── Run + paragraph emission ─────────────────────────────────────────────────

type Media = { id: string; name: string; bytes: Uint8Array; contentType: string };

class DocxBuilder {
  body: string[] = [];
  media: Media[] = [];
  rels: string[] = [];
  relSeq = 10;
  usesBullets = false;
  images: Map<string, Uint8Array>;
  warnings: string[] = [];

  constructor(images?: Map<string, Uint8Array>) {
    this.images = images ?? new Map();
  }

  runProps(ctx: Ctx): string {
    const parts: string[] = [];
    if (ctx.bold) parts.push('<w:b/>');
    if (ctx.italic) parts.push('<w:i/>');
    if (ctx.underline) parts.push('<w:u w:val="single"/>');
    if (ctx.color) parts.push(`<w:color w:val="${ctx.color}"/>`);
    if (ctx.fontSize) {
      const half = pxToHalfPt(ctx.fontSize);
      parts.push(`<w:sz w:val="${half}"/><w:szCs w:val="${half}"/>`);
    }
    if (ctx.tracking && ctx.fontSize) {
      parts.push(`<w:spacing w:val="${Math.round(ctx.tracking * ctx.fontSize * 15)}"/>`);
    }
    return parts.length > 0 ? `<w:rPr>${parts.join('')}</w:rPr>` : '';
  }

  textRun(text: string, ctx: Ctx): string {
    if (!text) return '';
    const t = ctx.uppercase ? text.toUpperCase() : text;
    return `<w:r>${this.runProps(ctx)}<w:t xml:space="preserve">${xmlEscape(t)}</w:t></w:r>`;
  }

  fieldRun(instruction: 'PAGE' | 'NUMPAGES', ctx: Ctx): string {
    return `<w:r>${this.runProps(ctx)}<w:fldChar w:fldCharType="begin"/></w:r><w:r>${this.runProps(ctx)}<w:instrText xml:space="preserve"> ${instruction} </w:instrText></w:r><w:r>${this.runProps(ctx)}<w:fldChar w:fldCharType="end"/></w:r>`;
  }

  imageRun(node: TakumiNode): string {
    const src = node.src ?? '';
    const bytes = this.images.get(src);
    if (!bytes) {
      this.warnings.push(
        src.trimStart().startsWith('<')
          ? 'inline <svg> skipped (not representable in DOCX v1)'
          : `image skipped (no bytes): ${src}`,
      );
      return '';
    }
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
    const id = `rIdImg${this.relSeq++}`;
    const name = `image${this.media.length + 1}.${isPng ? 'png' : 'jpeg'}`;
    this.media.push({
      id,
      name,
      bytes,
      contentType: isPng ? 'image/png' : 'image/jpeg',
    });
    this.rels.push(
      `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${name}"/>`,
    );
    const attrs = node.attributes ?? {};
    const w = Number((node as { width?: number }).width ?? attrs.width ?? 64);
    const h = Number((node as { height?: number }).height ?? attrs.height ?? 64);
    const cx = pxToEmu(w);
    const cy = pxToEmu(h);
    const docPrId = this.relSeq++;
    return (
      `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">` +
      `<wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${docPrId}" name="${xmlEscape(attrs.alt ?? name)}"/>` +
      `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
      `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
      `<pic:nvPicPr><pic:cNvPr id="${docPrId}" name="${xmlEscape(name)}"/><pic:cNvPicPr/></pic:nvPicPr>` +
      `<pic:blipFill><a:blip r:embed="${id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
      `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>` +
      `</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`
    );
  }

  /** Inline nodes of one paragraph → run XML. Counters become fields. */
  inlineRuns(nodes: TakumiNode[], ctx: Ctx): string {
    let out = '';
    for (const node of nodes) {
      if (node.type === 'text') {
        out += this.textRun(textContent(node), ctx);
        continue;
      }
      if (node.type === 'image') {
        out += this.imageRun(node);
        continue;
      }
      const cls = (node as { className?: string }).className;
      if (cls === 'pageNumber') {
        out += this.fieldRun('PAGE', ctx);
        continue;
      }
      if (cls === 'totalPages') {
        out += this.fieldRun('NUMPAGES', ctx);
        continue;
      }
      const childCtx = inheritInline(ctx, nodeStyle(node));
      if (node.tagName === 'b' || node.tagName === 'strong') childCtx.bold = true;
      if (node.tagName === 'i' || node.tagName === 'em') childCtx.italic = true;
      if (node.tagName === 'u') childCtx.underline = true;
      if (node.tagName === 'br') {
        out += '<w:r><w:br/></w:r>';
        continue;
      }
      out += this.inlineRuns(node.children ?? [], childCtx);
    }
    return out;
  }

  paragraphProps(
    ctx: Ctx,
    opts: { heading?: 1 | 2 | 3; bullet?: boolean; noSpacing?: boolean } = {},
  ): string {
    const parts: string[] = [];
    if (opts.heading) parts.push(`<w:pStyle w:val="Heading${opts.heading}"/>`);
    if (opts.bullet) parts.push('<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>');
    if (ctx.pageBreakBefore) parts.push('<w:pageBreakBefore/>');
    if (ctx.keepTogether) parts.push('<w:keepLines/><w:keepNext w:val="0"/>');
    const before = ctx.spaceBefore !== undefined ? pxToTwip(ctx.spaceBefore) : undefined;
    const line = ctx.lineHeight ? Math.round(ctx.lineHeight * 240) : undefined;
    if (!opts.noSpacing && (before !== undefined || line !== undefined)) {
      parts.push(
        `<w:spacing${before !== undefined ? ` w:before="${before}"` : ''} w:after="0"${line !== undefined ? ` w:line="${line}" w:lineRule="auto"` : ''}/>`,
      );
    }
    if (ctx.background) parts.push(`<w:shd w:val="clear" w:fill="${ctx.background}"/>`);
    if (ctx.borderBottom) {
      parts.push(
        `<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="4" w:color="${ctx.borderBottom.color}"/></w:pBdr>`,
      );
    }
    if (ctx.align && ctx.align !== 'left') parts.push(`<w:jc w:val="${ctx.align}"/>`);
    return `<w:pPr>${parts.join('')}</w:pPr>`;
  }

  paragraph(
    inline: TakumiNode[],
    ctx: Ctx,
    opts: { heading?: 1 | 2 | 3; bullet?: boolean } = {},
  ): string {
    return `<w:p>${this.paragraphProps(ctx, opts)}${this.inlineRuns(inline, ctx)}</w:p>`;
  }

  /**
   * A flex row whose children are all inline (KeyValue rows, totals rows,
   * justify-between footers) → one paragraph with a right tab stop.
   */
  flexRowParagraph(node: TakumiNode, ctx: Ctx, widthTwips: number): string {
    const children = node.children ?? [];
    const props = this.paragraphProps(ctx).replace(
      '<w:pPr>',
      `<w:pPr><w:tabs><w:tab w:val="right" w:pos="${widthTwips}"/></w:tabs>`,
    );
    let runs = '';
    children.forEach((child, i) => {
      if (i > 0) runs += '<w:r><w:tab/></w:r>';
      runs += this.inlineRuns([child], inheritInline(ctx, nodeStyle(child)));
    });
    return `<w:p>${props}${runs}</w:p>`;
  }

  table(node: TakumiNode, ctx: Ctx, widthTwips: number): string {
    const rows: { cells: TakumiNode[]; header: boolean; style: ResolvedStyle }[] = [];
    const visitRows = (group: TakumiNode, header: boolean) => {
      for (const child of group.children ?? []) {
        if (child.tagName === 'tr') {
          rows.push({
            cells: (child.children ?? []).filter((c) => c.tagName === 'th' || c.tagName === 'td'),
            header,
            style: inheritInline(ctx, nodeStyle(child)),
          });
        } else if (child.tagName === 'thead') visitRows(child, true);
        else if (child.tagName === 'tbody' || child.tagName === 'tfoot') visitRows(child, false);
      }
    };
    visitRows(node, false);
    if (rows.length === 0) return '';

    const cols = Math.max(...rows.map((r) => r.cells.length));
    const colWidth = Math.floor(widthTwips / cols);
    const grid = `<w:tblGrid>${Array.from({ length: cols }, () => `<w:gridCol w:w="${colWidth}"/>`).join('')}</w:tblGrid>`;
    const borders =
      '<w:tblBorders>' +
      ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
        .map((side) => `<w:${side} w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/>`)
        .join('') +
      '</w:tblBorders>';
    const tblPr = `<w:tblPr><w:tblW w:w="${widthTwips}" w:type="dxa"/>${borders}<w:tblLayout w:type="fixed"/></w:tblPr>`;

    let xml = `<w:tbl>${tblPr}${grid}`;
    for (const row of rows) {
      const trPr = row.header ? '<w:trPr><w:tblHeader/></w:trPr>' : '';
      xml += `<w:tr>${trPr}`;
      for (let c = 0; c < cols; c++) {
        const cell = row.cells[c];
        const cellStyle = cell ? inheritInline(row.style, nodeStyle(cell)) : row.style;
        if (cell?.tagName === 'th') cellStyle.bold = cellStyle.bold ?? true;
        const shade = cellStyle.background
          ? `<w:shd w:val="clear" w:fill="${cellStyle.background}"/>`
          : '';
        const tcPr = `<w:tcPr><w:tcW w:w="${colWidth}" w:type="dxa"/>${shade}<w:tcMar><w:top w:w="60" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tcMar></w:tcPr>`;
        const content = cell ? this.cellBlocks(cell, cellStyle, colWidth) : '<w:p/>';
        xml += `<w:tc>${tcPr}${content}</w:tc>`;
      }
      xml += '</w:tr>';
    }
    xml += '</w:tbl>';
    return xml;
  }

  /** Cell content: one or more paragraphs (a cell must end with a paragraph). */
  cellBlocks(cell: TakumiNode, ctx: Ctx, widthTwips: number): string {
    const children = inlineChildrenOf(cell);
    if (children.every(isInlineNode)) {
      const p = this.paragraph(children, { ...ctx, spaceBefore: undefined });
      return p || '<w:p/>';
    }
    const out = this.blocks(children, { ...ctx, spaceBefore: undefined }, widthTwips);
    return out.endsWith('</w:p>') ? out : `${out}<w:p/>`;
  }

  /** Block-level walk: emits paragraphs/tables into XML. */
  blocks(nodes: TakumiNode[], ctx: Ctx, widthTwips: number): string {
    let xml = '';
    for (const node of nodes) {
      if (node.type === 'text' && !isCollapsedBlock(node)) {
        const text = textContent(node).trim();
        if (text) xml += this.paragraph([node], ctx);
        continue;
      }
      const tag = node.tagName ?? '';
      const style = inheritInline(ctx, nodeStyle(node));
      const ownStyle = nodeStyle(node);
      // Block-level flags live on the block itself, not inherited context.
      style.pageBreakBefore = ownStyle.pageBreakBefore;
      style.keepTogether = ownStyle.keepTogether || ctx.keepTogether;
      style.spaceBefore = ownStyle.spaceBefore;
      style.borderBottom = ownStyle.borderBottom;
      style.align = ownStyle.align ?? ctx.align;

      if (tag === 'table') {
        if (style.spaceBefore)
          xml += `<w:p>${this.paragraphProps({ spaceBefore: style.spaceBefore })}</w:p>`;
        xml += this.table(node, { ...style, spaceBefore: undefined }, widthTwips);
        continue;
      }
      if (/^h[1-6]$/.test(tag)) {
        const level = Math.min(3, Number(tag[1])) as 1 | 2 | 3;
        xml += this.paragraph(inlineChildrenOf(node), { bold: true, ...style }, { heading: level });
        continue;
      }
      if (tag === 'p') {
        xml += this.paragraph(inlineChildrenOf(node), style);
        continue;
      }
      if (tag === 'ul' || tag === 'ol') {
        this.usesBullets = true;
        for (const li of node.children ?? []) {
          xml += this.paragraph(inlineChildrenOf(li), inheritInline(style, nodeStyle(li)), {
            bullet: true,
          });
        }
        continue;
      }
      if (node.type === 'image') {
        xml += `<w:p>${this.paragraphProps(style)}${this.imageRun(node)}</w:p>`;
        continue;
      }
      if (tag === 'svg') {
        this.warnings.push('inline <svg> skipped (not representable in DOCX v1)');
        continue;
      }

      const children = inlineChildrenOf(node);
      const allInline = children.length > 0 && children.every(isInlineNode);
      const tw = (node as { tw?: string }).tw ?? '';
      const isFlexRow = tw.includes('flex') && !tw.includes('flex-col');

      if (allInline) {
        if (isFlexRow && children.length > 1 && tw.includes('justify-between')) {
          xml += this.flexRowParagraph(node, style, widthTwips);
        } else if (isFlexRow && tw.includes('justify-center')) {
          xml += this.paragraph(children, { ...style, align: 'center' });
        } else if (isFlexRow && tw.includes('justify-end')) {
          xml += this.paragraph(children, { ...style, align: 'right' });
        } else if (isFlexRow || isCollapsedBlock(node)) {
          xml += this.paragraph(children, style);
        } else {
          // Column/block container of inline children: each child stacks as
          // its own paragraph (a flex-col of spans is a run of lines).
          let first = true;
          for (const child of children) {
            const childStyle = inheritInline(style, nodeStyle(child));
            xml += this.paragraph([child], {
              ...childStyle,
              spaceBefore: first ? style.spaceBefore : nodeStyle(child).spaceBefore,
              pageBreakBefore: first ? style.pageBreakBefore : undefined,
              borderBottom: nodeStyle(child).borderBottom,
            });
            first = false;
          }
        }
        continue;
      }
      if (children.length === 0) {
        // Empty styled div: signature line (border-b) or spacer.
        if (style.borderBottom || style.background)
          xml += `<w:p>${this.paragraphProps(style)}</w:p>`;
        continue;
      }
      // Mixed/block children: recurse. First child carries the group's
      // spacing/break; background shading applies to all descendants.
      const inner: Ctx = {
        ...style,
        spaceBefore: undefined,
        pageBreakBefore: undefined,
        borderBottom: undefined,
      };
      let childXml = this.blocks(children, inner, widthTwips);
      if (style.pageBreakBefore) {
        childXml = childXml.replace('<w:pPr>', '<w:pPr><w:pageBreakBefore/>');
      }
      if (style.spaceBefore !== undefined) {
        // Push the group's top margin onto its first paragraph/table.
        childXml = childXml.replace(
          /<w:pPr>(?!<w:pageBreakBefore\/><w:spacing)/,
          `<w:pPr><w:spacing w:before="${pxToTwip(style.spaceBefore)}" w:after="0"/>`,
        );
      }
      xml += childXml;
    }
    return xml;
  }
}

// ── Document assembly ────────────────────────────────────────────────────────

function marginTwips(margin: DocxOptions['pageOptions'] extends undefined ? never : unknown): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const def = { top: 720, right: 720, bottom: 720, left: 720 };
  if (typeof margin === 'number') {
    const t = pxToTwip(margin);
    return { top: t, right: t, bottom: t, left: t };
  }
  if (margin && typeof margin === 'object') {
    const m = margin as Record<string, unknown>;
    const side = (v: unknown, fallback: number) => (typeof v === 'number' ? pxToTwip(v) : fallback);
    return {
      top: side(m.top, def.top),
      right: side(m.right, def.right),
      bottom: side(m.bottom, def.bottom),
      left: side(m.left, def.left),
    };
  }
  return def;
}

const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const W_NS =
  'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"';

export function docxFromNodeTree(
  root: TakumiNode,
  opts: DocxOptions = {},
): {
  bytes: Uint8Array;
  warnings: string[];
} {
  const pageOptions = opts.pageOptions ?? {};
  const sizeKey = typeof pageOptions.size === 'string' ? pageOptions.size : 'a4';
  const page = PAGE_SIZES_TWIPS[sizeKey] ?? PAGE_SIZES_TWIPS.a4;
  const margins = marginTwips(pageOptions.margin as never);
  const contentWidth = page.w - margins.left - margins.right;

  const builder = new DocxBuilder(opts.images);
  const bodyXml = builder.blocks([root], { fontSize: 12, lineHeight: 1.5 }, contentWidth);

  // Bands: one paragraph, tab-separated for justify-between rows.
  const bandXml = (node: TakumiNode | null | undefined): string => {
    if (!node) return '<w:p/>';
    const ctx = inheritInline({ fontSize: 9, color: '94A3B8' }, nodeStyle(node));
    const tw = (node as { tw?: string }).tw ?? '';
    if (tw.includes('justify-between') && (node.children ?? []).length > 1) {
      return builder.flexRowParagraph(node, ctx, contentWidth);
    }
    const align: ResolvedStyle['align'] = tw.includes('justify-between')
      ? 'left'
      : tw.includes('justify-end')
        ? 'right'
        : 'center';
    const inline = (node.children ?? []).every(isInlineNode) ? (node.children ?? []) : [node];
    return builder.paragraph(inline, { ...ctx, align });
  };
  const headerXml = opts.headerNode ? bandXml(opts.headerNode) : null;
  const footerXml = opts.footerNode ? bandXml(opts.footerNode) : null;

  const relEntries: string[] = [
    '<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>',
    '<Relationship Id="rIdNumbering" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>',
    ...builder.rels,
  ];
  const sectRefs: string[] = [];
  if (headerXml) {
    relEntries.push(
      '<Relationship Id="rIdHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>',
    );
    sectRefs.push('<w:headerReference w:type="default" r:id="rIdHeader"/>');
  }
  if (footerXml) {
    relEntries.push(
      '<Relationship Id="rIdFooter" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>',
    );
    sectRefs.push('<w:footerReference w:type="default" r:id="rIdFooter"/>');
  }

  const sectPr =
    `<w:sectPr>${sectRefs.join('')}<w:pgSz w:w="${page.w}" w:h="${page.h}"/>` +
    `<w:pgMar w:top="${margins.top}" w:right="${margins.right}" w:bottom="${margins.bottom}" w:left="${margins.left}" w:header="360" w:footer="360" w:gutter="0"/></w:sectPr>`;

  const documentXml = `${XML_HEAD}<w:document ${W_NS}><w:body>${bodyXml}${sectPr}</w:body></w:document>`;

  const stylesXml =
    `${XML_HEAD}<w:styles ${W_NS}>` +
    `<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Helvetica Neue" w:hAnsi="Helvetica Neue" w:cs="Helvetica Neue"/><w:sz w:val="24"/></w:rPr></w:rPrDefault></w:docDefaults>` +
    [1, 2, 3]
      .map(
        (n) =>
          `<w:style w:type="paragraph" w:styleId="Heading${n}"><w:name w:val="heading ${n}"/><w:basedOn w:val="Normal"/><w:pPr><w:outlineLvl w:val="${n - 1}"/></w:pPr></w:style>`,
      )
      .join('') +
    `<w:style w:type="paragraph" w:styleId="Normal" w:default="1"><w:name w:val="Normal"/></w:style>` +
    `</w:styles>`;

  const numberingXml =
    `${XML_HEAD}<w:numbering ${W_NS}>` +
    `<w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:pPr><w:ind w:left="360" w:hanging="200"/></w:pPr></w:lvl></w:abstractNum>` +
    `<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>`;

  const coreXml =
    `${XML_HEAD}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/">` +
    `<dc:title>${xmlEscape(opts.title ?? '')}</dc:title><dc:creator>open-pdf</dc:creator></cp:coreProperties>`;

  const contentTypes =
    `${XML_HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Default Extension="png" ContentType="image/png"/>` +
    `<Default Extension="jpeg" ContentType="image/jpeg"/>` +
    `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
    `<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>` +
    `<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>` +
    (headerXml
      ? '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>'
      : '') +
    (footerXml
      ? '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>'
      : '') +
    `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>` +
    `</Types>`;

  const rootRels =
    `${XML_HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>` +
    `</Relationships>`;

  const documentRels = `${XML_HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relEntries.join('')}</Relationships>`;

  const encoder = new TextEncoder();
  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': encoder.encode(contentTypes),
    '_rels/.rels': encoder.encode(rootRels),
    'docProps/core.xml': encoder.encode(coreXml),
    'word/document.xml': encoder.encode(documentXml),
    'word/styles.xml': encoder.encode(stylesXml),
    'word/numbering.xml': encoder.encode(numberingXml),
    'word/_rels/document.xml.rels': encoder.encode(documentRels),
  };
  if (headerXml) {
    files['word/header1.xml'] = encoder.encode(`${XML_HEAD}<w:hdr ${W_NS}>${headerXml}</w:hdr>`);
  }
  if (footerXml) {
    files['word/footer1.xml'] = encoder.encode(`${XML_HEAD}<w:ftr ${W_NS}>${footerXml}</w:ftr>`);
  }
  for (const m of builder.media) {
    files[`word/media/${m.name}`] = m.bytes;
  }

  return { bytes: zipSync(files), warnings: builder.warnings };
}
