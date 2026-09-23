import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Press Release',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 56, right: 56, bottom: 72, left: 56 },
  footer: (
    <div tw="flex w-full items-center justify-between border-t-2 border-zinc-200 pt-3 text-[10px] text-zinc-500">
      <span>123 Market St, San Francisco, CA 94103</span>
      <span tw="flex">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

const body = [
  'Lumen Labs today announced the launch of Folio, an open-source React toolkit for generating professional PDF documents from the same components teams already use to build their products.',
  'Folio follows a registry-based distribution model, letting developers add print-ready document blocks such as invoices, reports, and forms with a single command, then own and customize the source.',
  'The toolkit ships with themes, pagination controls, and a live preview, and is available today under the MIT license.',
];

const Label = ({ children }: { children: string }) => (
  <h2 tw="m-0 mb-[2px] text-[9px] font-bold uppercase text-zinc-500">{children}</h2>
);

export default function PressRelease() {
  return (
    <main tw="flex flex-col text-[12px] leading-relaxed text-zinc-900">
      <div tw="flex items-center border-b-2 border-zinc-200 pb-4">
        <span tw="flex-1 text-[20px] font-bold leading-tight">Lumen Labs</span>
        <span tw="text-[11px] font-medium">September 10, 2026</span>
      </div>

      <section tw="mt-7 flex flex-col">
        <span tw="text-[10px] font-bold uppercase text-blue-800">For Immediate Release</span>
        <h1 tw="m-0 mt-2 text-[28px] font-bold leading-tight">
          Lumen Labs Launches Folio, an Open-Source PDF Toolkit for Developers
        </h1>
        <p tw="m-0 mt-2 text-[18px] leading-snug text-zinc-500">
          New library makes generating professional PDFs in React effortless
        </p>
      </section>

      <section tw="mt-7 flex flex-col">
        <span tw="text-[12px] font-semibold uppercase">San Francisco, CA, September 10, 2026</span>
        {body.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} tw="m-0 mt-[10px]">
            {paragraph}
          </p>
        ))}
      </section>

      <blockquote
        tw="m-0 mt-4 flex flex-col border-l-4 border-blue-800 py-2 pl-4"
        style={{ breakInside: 'avoid' }}
      >
        <p tw="m-0 text-[15px] italic leading-snug">
          "We built Folio because generating PDFs in React was unnecessarily painful. Now it feels
          like writing any other component."
        </p>
        <span tw="mt-1 text-[10px] text-zinc-500">Dana Whitaker, CTO, Lumen Labs</span>
      </blockquote>

      <section tw="mt-4 flex flex-col">
        <Label>About Lumen Labs</Label>
        <p tw="m-0">
          Lumen Labs builds developer tools and open-source software for teams that ship documents,
          dashboards, and data products.
        </p>
      </section>

      <section tw="mt-7 flex flex-col text-[10px]" style={{ breakInside: 'avoid' }}>
        <Label>Media Contact</Label>
        <span>Press Team</span>
        <span>press@lumenlabs.example</span>
        <span>(555) 123-4567</span>
      </section>

      <span tw="mt-7 flex justify-center text-[12px] font-medium">###</span>
    </main>
  );
}
