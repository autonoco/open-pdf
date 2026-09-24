import type { DocMeta, PageOptions } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Gift Certificate',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: { width: 1123, height: 794 },
  margin: 32,
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div tw="flex flex-1 flex-col">
    <span tw="mb-1 text-[12px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
    <span tw="text-[19px] font-medium text-zinc-900">{value}</span>
  </div>
);

export default function GiftCertificate() {
  return (
    <main tw="flex flex-col rounded-lg border-4 border-zinc-900 p-5 text-zinc-900">
      <div tw="flex flex-col rounded-md border border-dashed border-zinc-900 px-6 py-5">
        <div tw="mb-3 flex flex-col items-center">
          <div tw="mb-2 flex h-[37px] w-[37px] items-center justify-center rounded-md bg-zinc-900">
            <span tw="text-[18px] font-bold text-white">M</span>
          </div>
          <h1 tw="m-0 text-center text-[29px] font-bold uppercase tracking-[3px]">
            Gift Certificate
          </h1>
          <span tw="mt-1 text-center text-[17px] font-medium">Meridian Coffee House</span>
        </div>

        <div tw="my-3 flex justify-center rounded-md border-2 border-zinc-900 bg-zinc-100 px-6 py-4">
          <span tw="text-[48px] font-bold leading-none">$50.00</span>
        </div>

        <div tw="mb-3 flex gap-9">
          <Field label="To" value="Sarah" />
          <Field label="From" value="Mom & Dad" />
        </div>

        <div tw="my-3 flex justify-center rounded-sm bg-zinc-100 p-3">
          <p tw="text-center text-[13px] italic leading-snug">
            "Happy Birthday! Enjoy a coffee on us."
          </p>
        </div>

        <div tw="my-3 flex flex-col items-center rounded-sm border border-zinc-200 bg-white px-5 py-3">
          <span tw="mb-1 text-[12px] font-bold uppercase tracking-widest text-zinc-500">
            Certificate Code
          </span>
          <span tw="text-[17px] font-bold tracking-[2px]">MCH-GC-2026-00891</span>
        </div>

        <div tw="mb-3 flex flex-col items-center">
          <span tw="mb-1 text-[12px] font-bold uppercase tracking-widest text-zinc-500">
            Valid Until
          </span>
          <span tw="text-[16px] font-bold">March 31, 2027</span>
        </div>

        <p tw="mt-2 text-center text-[12px] leading-snug">
          Present this certificate at any Meridian Coffee House location.
        </p>
        <p tw="mt-3 text-center text-[11px] leading-snug text-zinc-500">
          No cash value. Non-refundable. One use per visit.
        </p>
      </div>
    </main>
  );
}
