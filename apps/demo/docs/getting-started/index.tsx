import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Welcome to open-pdf',
  createdAt: '2026-08-18T00:00:01.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 56, right: 64, bottom: 72, left: 64 },
  footer: (
    <div tw="flex w-full justify-center text-[9px] text-slate-400">
      <span tw="flex">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

export default function GettingStarted() {
  return (
    <main tw="flex flex-col text-[12px] leading-relaxed text-slate-800">
      <span tw="text-[11px] font-bold uppercase tracking-widest text-indigo-500">open-pdf</span>
      <h1 tw="mt-2 text-[34px] font-bold leading-tight tracking-tight text-slate-900">
        The PDF framework built for agents
      </h1>
      <p tw="mt-4 text-[13px] text-slate-600">
        This document is a React component. Your coding agent writes it, this preview renders it as
        a real PDF, and the Download button hands you the same bytes you are looking at.
      </p>

      <h2 tw="mt-10 text-[18px] font-bold text-slate-900">How it works</h2>
      <p tw="mt-2">
        Every document lives at <span tw="font-mono text-[11px]">docs/&lt;id&gt;/index.tsx</span>{' '}
        and default-exports one component of HTML-shaped JSX styled with Tailwind via the
        <span tw="font-mono text-[11px]"> tw</span> prop. Content flows; the engine paginates,
        repeats table headers, and resolves page counters in the footer band below.
      </p>

      <table tw="mt-6 w-full border border-slate-200 text-[11px]">
        <thead>
          <tr tw="bg-slate-50 font-bold">
            <th tw="border-b border-slate-200 p-2 text-left">You write</th>
            <th tw="border-b border-slate-200 p-2 text-left">The engine does</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td tw="border-b border-slate-100 p-2">Flowing JSX content</td>
            <td tw="border-b border-slate-100 p-2">Pagination with widow/orphan control</td>
          </tr>
          <tr>
            <td tw="border-b border-slate-100 p-2">A real HTML table</td>
            <td tw="border-b border-slate-100 p-2">Column tracks and repeating header rows</td>
          </tr>
          <tr>
            <td tw="border-b border-slate-100 p-2">
              <span tw="font-mono text-[10px]">pageOptions.footer</span>
            </td>
            <td tw="border-b border-slate-100 p-2">A running band on every page</td>
          </tr>
          <tr>
            <td tw="p-2">
              <span tw="font-mono text-[10px]">breakBefore: 'page'</span>
            </td>
            <td tw="p-2">A hard page start, like the next section</td>
          </tr>
        </tbody>
      </table>

      <div tw="flex flex-col" style={{ breakBefore: 'page' }}>
        <h2 tw="text-[18px] font-bold text-slate-900">Try the loop</h2>
        <p tw="mt-2">
          Open this file and change anything. The preview re-renders in well under half a second.
          Then ask your agent for something bigger: a new section, a different layout, a whole new
          document with <span tw="font-mono text-[11px]">/create-doc</span>.
        </p>
        <div tw="mt-6 flex flex-col rounded bg-indigo-50 p-4 text-[11px] text-indigo-900">
          <span tw="font-bold">The contract</span>
          <span tw="mt-1">
            Preview and export are the same renderer. What you see here is not an approximation of
            the PDF. It is the PDF.
          </span>
        </div>
      </div>
    </main>
  );
}
