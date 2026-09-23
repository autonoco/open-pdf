import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Minimal Invoice',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 72, right: 72, bottom: 88, left: 72 },
  footer: (
    <div tw="flex w-full items-center justify-between border-t-2 border-zinc-200 pt-3 text-[13px] text-zinc-500">
      <span>Annual enterprise subscription. Please retain for your records.</span>
      <span tw="flex">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

const items = [
  { description: 'Annual License Plan', qty: 1, rate: 25000 },
  { description: 'Support & Maintenance', qty: 12, rate: 1500 },
  { description: 'Custom Integration', qty: 1, rate: 12000 },
];

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const subtotal = items.reduce((sum, it) => sum + it.qty * it.rate, 0);
const tax = subtotal * 0.07;

const Label = ({ children }: { children: string }) => (
  <span tw="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-900">{children}</span>
);

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div tw="flex py-1 text-[13px]">
    <span tw="flex-1 font-medium text-zinc-500">{label}</span>
    <span tw="flex-1 text-right">{value}</span>
  </div>
);

export default function InvoiceMinimal() {
  return (
    <main tw="flex flex-col text-[14px] text-zinc-900">
      <div tw="flex items-start">
        <div tw="mr-6 flex flex-1 items-center justify-between border-b-4 border-zinc-900 pb-4">
          <div tw="flex flex-col">
            <h1 tw="m-0 text-[27px] font-bold leading-tight">Meridian Systems</h1>
            <span tw="mt-1 text-[14px] text-zinc-500">Miami, FL · billing@meridian.example</span>
          </div>
        </div>
        <div tw="flex flex-col items-end rounded-sm border-2 border-zinc-900 px-4 py-2">
          <span tw="text-[9px] font-bold uppercase tracking-wider text-zinc-900">Invoice</span>
          <span tw="text-[19px] font-bold">INV-2026-003</span>
          <span tw="text-[11px] text-zinc-500">September 23, 2026</span>
        </div>
      </div>

      <div tw="mt-9 flex">
        <div tw="flex w-1/2 flex-col pr-7">
          <Label>Bill To</Label>
          <span tw="text-[16px]">Northwind Industrial Group</span>
          <span tw="text-[13px] leading-relaxed text-zinc-500">500 Enterprise Way, Building A</span>
          <span tw="text-[13px] leading-relaxed text-zinc-500">finance@northwind.example</span>
          <span tw="text-[13px] leading-relaxed text-zinc-500">+1 (555) 246-8135</span>
        </div>
        <div tw="flex w-1/2 flex-col">
          <Label>Invoice Details</Label>
          <Detail label="Due Date" value="October 23, 2026" />
          <Detail label="Payment" value="ACH Transfer / Check" />
          <Detail label="Tax ID" value="84-1234567" />
        </div>
      </div>

      <table tw="mt-9 w-full text-[13px]">
        <thead>
          <tr tw="bg-zinc-100 text-[13px] font-semibold uppercase tracking-wide">
            <th tw="border-b-2 border-zinc-200 px-2.5 py-1 text-left">Description</th>
            <th tw="border-b-2 border-zinc-200 px-2.5 py-1 text-center">Qty</th>
            <th tw="border-b-2 border-zinc-200 px-2.5 py-1 text-right">Rate</th>
            <th tw="border-b-2 border-zinc-200 px-2.5 py-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.description}>
              <td tw="border-b border-zinc-200 px-2.5 py-1">{it.description}</td>
              <td tw="border-b border-zinc-200 px-2.5 py-1 text-center">{String(it.qty)}</td>
              <td tw="border-b border-zinc-200 px-2.5 py-1 text-right">{money(it.rate)}</td>
              <td tw="border-b border-zinc-200 px-2.5 py-1 text-right">
                {money(it.qty * it.rate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div tw="mt-7 flex justify-end" style={{ breakInside: 'avoid' }}>
        <div tw="flex w-[320px] flex-col text-[13px]">
          <div tw="flex justify-between border-b border-zinc-200 py-1.5">
            <span tw="font-medium text-zinc-500">Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div tw="flex justify-between border-b border-zinc-200 py-1.5">
            <span tw="font-medium text-zinc-500">Tax (7%)</span>
            <span>{money(tax)}</span>
          </div>
          <div tw="flex items-center justify-between py-1.5">
            <span tw="text-[16px] font-bold">Balance Due</span>
            <span tw="text-[17px] font-bold">{money(subtotal + tax)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
