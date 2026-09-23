import { fromJsx } from '@takumi-rs/helpers/jsx';
import { describe, expect, it } from 'vitest';
import type { TakumiNode } from '../shared/takumi-doc.ts';
import { markdownFromNodeTree } from './markdown.ts';

async function md(element: Parameters<typeof fromJsx>[0], images?: Map<string, Uint8Array>) {
  const { node } = await fromJsx(element);
  return markdownFromNodeTree(node as TakumiNode, { images });
}

describe('markdownFromNodeTree', () => {
  it('maps headings, paragraphs and emphasis', async () => {
    const out = await md(
      <main tw="flex flex-col">
        <h1>Title</h1>
        <p>
          Plain <strong>bold</strong> and <em>italic</em> text
        </p>
        <h2>Section</h2>
      </main>,
    );
    expect(out).toBe('# Title\n\nPlain **bold** and *italic* text\n\n## Section\n');
  });

  it('treats font-bold spans as bold', async () => {
    const out = await md(
      <p>
        Total <span tw="font-semibold">$40</span>
      </p>,
    );
    expect(out).toBe('Total **$40**\n');
  });

  it('renders tables as GFM with a header row', async () => {
    const out = await md(
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Fee</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Build | ship</td>
            <td>$10</td>
          </tr>
        </tbody>
      </table>,
    );
    expect(out).toBe('| Item | Fee |\n| --- | --- |\n| Build \\| ship | $10 |\n');
  });

  it('joins justify-between rows onto one line and stacks columns', async () => {
    const out = await md(
      <div tw="flex flex-col">
        <div tw="flex justify-between">
          <span>Client</span>
          <span>Harborline</span>
        </div>
        <div tw="flex flex-col">
          <span>2201 Biscayne Blvd</span>
          <span>Miami, FL</span>
        </div>
      </div>,
    );
    expect(out).toBe('Client · Harborline\n\n2201 Biscayne Blvd  \nMiami, FL\n');
  });

  it('writes lists', async () => {
    const out = await md(
      <ol>
        <li>One</li>
        <li>Two</li>
      </ol>,
    );
    expect(out).toBe('1. One\n2. Two\n');
  });

  it('drops markers the doc draws inside list items', async () => {
    const numbered = await md(
      <ul>
        <li tw="flex">
          <span>1.</span>
          <span>Warm up</span>
        </li>
        <li tw="flex">
          <span>2.</span>
          <span>Practice</span>
        </li>
      </ul>,
    );
    expect(numbered).toBe('1. Warm up\n2. Practice\n');
    const bullets = await md(
      <ol>
        <li>1. Review minutes</li>
        <li>2. Budget</li>
      </ol>,
    );
    expect(bullets).toBe('1. Review minutes\n2. Budget\n');
    expect(
      await md(
        <ul>
          <li>• Coffee</li>
        </ul>,
      ),
    ).toBe('- Coffee\n');
  });

  it('embeds known images as data URIs', async () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    const out = await md(
      <img src="/logo.png" alt="Logo" width={10} height={10} />,
      new Map([['/logo.png', png]]),
    );
    expect(out).toBe('![Logo](data:image/png;base64,iVBORw==)\n');
  });

  it('keeps links and backslashes intact inside table cells', async () => {
    const out = await md(
      <table>
        <tbody>
          <tr>
            <td>
              <a href="https://x.example/a|b (c)">C:\dir|x</a>
            </td>
          </tr>
        </tbody>
      </table>,
    );
    expect(out).toBe('|  |\n| --- |\n| [C:\\\\dir\\|x](https://x.example/a%7Cb%20%28c%29) |\n');
  });

  it('escapes Markdown syntax in text', async () => {
    expect(await md(<p>2 * 3 = [six]</p>)).toBe('2 \\* 3 = \\[six\\]\n');
  });
});
