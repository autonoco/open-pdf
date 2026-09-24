import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Modern Invoice',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 72, right: 72, bottom: 88, left: 72 },
  footer: (
    <div tw="flex w-full items-center justify-between border-t-2 border-zinc-200 pt-3 text-[13px] text-zinc-500">
      <span>Payment terms: Net 30 days. Thank you for your business!</span>
      <span tw="flex">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

const items = [
  { description: 'API Integration', qty: 1, unit: 15000 },
  { description: 'SEO Optimization', qty: 2, unit: 5500 },
  { description: 'Security Audit', qty: 1, unit: 7200 },
];

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const subtotal = items.reduce((sum, it) => sum + it.qty * it.unit, 0);
const tax = subtotal * 0.07;

const MetaLabel = ({ children }: { children: string }) => (
  <span tw="mb-1 text-[11px] font-bold uppercase tracking-wide text-zinc-500">{children}</span>
);

const MetaItem = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
  <div tw="flex flex-1 flex-col pr-4">
    <MetaLabel>{label}</MetaLabel>
    <span tw={strong ? 'text-[14px] font-bold' : 'text-[12px]'}>{value}</span>
  </div>
);

export default function InvoiceModern() {
  return (
    <main tw="flex flex-col text-[14px] text-zinc-900">
      <div tw="flex flex-col items-center rounded-sm bg-zinc-900 p-8">
        <h1 tw="m-0 text-center text-[27px] font-bold leading-tight text-white">
          Meridian Systems
        </h1>
        <span tw="mt-1 text-center text-[14px] text-white">
          Software Engineering · Miami, FL · billing@meridian.example
        </span>
      </div>

      <div tw="mt-9 flex">
        <MetaItem label="Invoice Number" value="INV-2026-002" strong />
        <MetaItem label="Invoice Date" value="September 23, 2026" />
        <MetaItem label="Due Date" value="October 23, 2026" />
        <div tw="mr-4 w-[1px] bg-zinc-200" />
        <div tw="flex flex-[2] flex-col text-[12px]">
          <MetaLabel>Billed To</MetaLabel>
          <span tw="font-bold">Brightline Analytics Inc.</span>
          <span tw="text-zinc-500">789 Innovation Blvd, Floor 3</span>
          <span tw="text-zinc-500">billing@brightline.example</span>
          <span tw="text-zinc-500">+1 (555) 987-6543</span>
        </div>
      </div>

      <table tw="mt-9 w-full text-[14px]">
        <thead>
          <tr tw="bg-zinc-900 text-[13px] font-semibold uppercase tracking-wide text-white">
            <th tw="px-3 py-2 text-left">Description</th>
            <th tw="px-3 py-2 text-center">Qty</th>
            <th tw="px-3 py-2 text-right">Unit Price</th>
            <th tw="px-3 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.description}>
              <td tw="border-b border-zinc-200 px-3 py-2">{it.description}</td>
              <td tw="border-b border-zinc-200 px-3 py-2 text-center">{String(it.qty)}</td>
              <td tw="border-b border-zinc-200 px-3 py-2 text-right">{money(it.unit)}</td>
              <td tw="border-b border-zinc-200 px-3 py-2 text-right">{money(it.qty * it.unit)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div tw="mt-6 flex" style={{ breakInside: 'avoid' }}>
        <div tw="flex flex-1 flex-col pr-7 text-[13px]">
          <MetaLabel>Payment Method</MetaLabel>
          <span>Wire Transfer / Bank Account</span>
          <span tw="text-zinc-500">Tax ID 84-1234567</span>
        </div>
        <div tw="flex w-[293px] flex-col text-[13px]">
          <div tw="flex justify-between border-b border-zinc-200 py-1.5">
            <span tw="font-medium text-zinc-500">Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div tw="flex justify-between border-b border-zinc-200 py-1.5">
            <span tw="font-medium text-zinc-500">Tax (7%)</span>
            <span>{money(tax)}</span>
          </div>
          <div tw="flex justify-between py-1.5 text-[16px] font-bold">
            <span>Total Due</span>
            <span>{money(subtotal + tax)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
