import type { DocMeta, PageOptions } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Creative Invoice',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 72, right: 72, bottom: 88, left: 72 },
  footer: (
    <div tw="flex w-full justify-center border-t-2 border-zinc-200 pt-3 text-[13px] text-zinc-500">
      <span>Thank you for choosing us for your creative needs!</span>
    </div>
  ),
};

const items = [
  { description: 'Brand Identity Design', qty: 1, rate: 8500 },
  { description: 'Marketing Collateral Package', qty: 1, rate: 4200 },
  { description: 'Social Media Assets (per set)', qty: 4, rate: 750 },
  { description: 'Motion Graphics (30s)', qty: 2, rate: 3500 },
];

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const subtotal = items.reduce((sum, it) => sum + it.qty * it.rate, 0);
const tax = subtotal * 0.065;

const Label = ({ children }: { children: string }) => (
  <span tw="mb-2 text-[11px] font-bold uppercase tracking-wider text-blue-500">{children}</span>
);

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div tw="flex py-1 text-[13px]">
    <span tw="flex-1 font-medium text-zinc-500">{label}</span>
    <span tw="flex-1 text-right">{value}</span>
  </div>
);

export default function InvoiceCreative() {
  return (
    <main tw="flex flex-col text-[14px] text-zinc-900">
      <div tw="flex items-center justify-between">
        <div tw="mr-6 flex flex-1 flex-col items-center border-b-2 border-zinc-200 pb-5">
          <h1 tw="m-0 text-center text-[27px] font-bold leading-tight">Meridian Studio</h1>
          <span tw="mt-1 text-center text-[14px] text-zinc-500">
            Brand and Motion Design · Miami, FL
          </span>
        </div>
        <div tw="flex flex-col items-center rounded-md bg-zinc-900 px-7 py-5">
          <span tw="mb-1 text-[11px] font-bold uppercase tracking-widest text-white">Invoice</span>
          <span tw="text-[21px] font-bold text-white">INV-2026-005</span>
        </div>
      </div>

      <div tw="mt-9 flex gap-10 border-l-4 border-blue-500 bg-zinc-100 py-3 pl-5 pr-4">
        <div tw="flex flex-1 flex-col">
          <Label>Billed To</Label>
          <span tw="text-[16px] font-semibold">Lumen and Ash Creative Co.</span>
          <span tw="text-[13px] leading-relaxed text-zinc-500">250 Design District, Loft 5</span>
          <span tw="text-[13px] leading-relaxed text-zinc-500">
            studio@lumenash.example · +1 (555) 321-7654
          </span>
        </div>
        <div tw="flex flex-1 flex-col">
          <Label>Invoice Info</Label>
          <Detail label="Issue Date" value="September 23, 2026" />
          <Detail label="Due Date" value="October 23, 2026" />
          <Detail label="Payment" value="Card / Bank Transfer" />
        </div>
      </div>

      <table tw="mt-9 w-full border-t border-b border-zinc-200 text-[14px]">
        <thead>
          <tr tw="bg-zinc-100 font-semibold">
            <th tw="border-b-2 border-zinc-200 px-3 py-2 text-left">Deliverable</th>
            <th tw="border-b-2 border-zinc-200 px-3 py-2 text-center">Qty</th>
            <th tw="border-b-2 border-zinc-200 px-3 py-2 text-right">Rate</th>
            <th tw="border-b-2 border-zinc-200 px-3 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={it.description} tw={i % 2 === 1 ? 'bg-zinc-100' : 'bg-white'}>
              <td tw="px-3 py-2">{it.description}</td>
              <td tw="px-3 py-2 text-center">{String(it.qty)}</td>
              <td tw="px-3 py-2 text-right">{money(it.rate)}</td>
              <td tw="px-3 py-2 text-right">{money(it.qty * it.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div tw="mt-8 flex" style={{ breakInside: 'avoid' }}>
        <div tw="flex flex-1 flex-col pr-7">
          <Label>Notes and Terms</Label>
          <p tw="text-[13px] leading-relaxed text-zinc-500">
            Creative work is protected under copyright. Full usage rights transfer upon payment.
          </p>
          <span tw="mt-1 text-[13px] text-zinc-500">Tax ID: 84-4567891</span>
        </div>
        <div tw="flex w-[320px] flex-col rounded-sm bg-zinc-100 p-5 text-[13px]">
          <div tw="flex justify-between border-b border-zinc-200 py-1.5">
            <span tw="font-medium text-zinc-500">Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div tw="flex justify-between border-b border-zinc-200 py-1.5">
            <span tw="font-medium text-zinc-500">Tax (6.5%)</span>
            <span>{money(tax)}</span>
          </div>
          <div tw="flex items-center justify-between py-1.5">
            <span tw="text-[17px] font-bold">Total</span>
            <span tw="text-[19px] font-bold text-blue-500">{money(subtotal + tax)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
