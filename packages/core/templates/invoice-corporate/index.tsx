import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Corporate Invoice',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 72, right: 72, bottom: 88, left: 72 },
  footer: (
    <div tw="flex w-full items-center justify-between border-t-2 border-zinc-200 pt-3 text-[13px] text-zinc-500">
      <span>Corporate billing, Net 30 terms apply. Inquiries: accounts@meridian.example</span>
      <span tw="flex">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

const items = [
  { description: 'Enterprise Software License', qty: 5, unit: 4500 },
  { description: 'Implementation Services', qty: 1, unit: 18000 },
  { description: 'Training Workshop (per session)', qty: 3, unit: 2500 },
  { description: 'Annual Support Package', qty: 1, unit: 8500 },
];

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const subtotal = items.reduce((sum, it) => sum + it.qty * it.unit, 0);
const tax = subtotal * 0.08;

const rule = (i: number) => (i < items.length - 1 ? 'border-b border-zinc-200' : '');

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div tw="flex py-1.5 text-[13px]">
    <span tw="flex-1 font-medium text-zinc-500">{label}</span>
    <span tw="flex-1 text-right">{value}</span>
  </div>
);

export default function InvoiceCorporate() {
  return (
    <main tw="flex flex-col text-[14px] text-zinc-900">
      <div tw="flex items-center justify-between border-b-2 border-zinc-200 pb-5">
        <div tw="flex flex-1 flex-col">
          <h1 tw="m-0 text-[27px] font-bold leading-tight">Meridian Systems</h1>
          <span tw="mt-1 text-[14px] text-zinc-500">Enterprise Software Solutions · Miami, FL</span>
        </div>
        <div tw="ml-5 flex h-[75px] w-[75px] items-center justify-center rounded-lg bg-zinc-900">
          <span tw="text-[32px] font-bold text-white">M</span>
        </div>
      </div>

      <div tw="mt-9 flex gap-8">
        <div tw="flex flex-1 flex-col">
          <span tw="mb-2 text-[12px] font-bold uppercase tracking-wider text-zinc-500">
            Invoice Details
          </span>
          <Detail label="Invoice #" value="INV-2026-004" />
          <Detail label="Issue Date" value="September 23, 2026" />
          <Detail label="Due Date" value="October 23, 2026" />
          <Detail label="Payment" value="Wire Transfer" />
        </div>
        <div tw="flex flex-1 flex-col">
          <span tw="mb-2 text-[12px] font-bold uppercase tracking-wider text-zinc-500">
            Bill To
          </span>
          <span tw="text-[16px] font-semibold">Northwind Industrial Group</span>
          <span tw="text-[13px] leading-relaxed text-zinc-500">100 Corporate Plaza, Tower B</span>
          <span tw="text-[13px] leading-relaxed text-zinc-500">accounts@northwind.example</span>
          <span tw="text-[13px] leading-relaxed text-zinc-500">+1 (555) 888-9999</span>
        </div>
      </div>

      <table tw="mt-9 w-full rounded-sm border border-zinc-200 text-[14px]">
        <thead>
          <tr tw="bg-zinc-100 font-bold">
            <th tw="border-b border-r border-zinc-200 px-3 py-2 text-left">Description</th>
            <th tw="border-b border-r border-zinc-200 px-3 py-2 text-center">Qty</th>
            <th tw="border-b border-r border-zinc-200 px-3 py-2 text-right">Unit Price</th>
            <th tw="border-b border-zinc-200 px-3 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={it.description}>
              <td tw={`${rule(i)} border-r border-zinc-200 px-3 py-2`}>{it.description}</td>
              <td tw={`${rule(i)} border-r border-zinc-200 px-3 py-2 text-center`}>
                {String(it.qty)}
              </td>
              <td tw={`${rule(i)} border-r border-zinc-200 px-3 py-2 text-right`}>
                {money(it.unit)}
              </td>
              <td tw={`${rule(i)} px-3 py-2 text-right`}>{money(it.qty * it.unit)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div tw="mt-7 flex justify-end rounded-md bg-zinc-100 p-5" style={{ breakInside: 'avoid' }}>
        <div tw="flex w-[347px] flex-col text-[14px]">
          <div tw="flex justify-between border-b border-zinc-200 py-1.5">
            <span tw="font-medium text-zinc-500">Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div tw="flex justify-between border-b border-zinc-200 py-1.5">
            <span tw="font-medium text-zinc-500">Tax (8%)</span>
            <span>{money(tax)}</span>
          </div>
          <div tw="flex items-center justify-between py-1.5">
            <span tw="text-[17px] font-bold">Total Due</span>
            <span tw="text-[19px] font-bold">{money(subtotal + tax)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
