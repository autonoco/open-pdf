import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Classic Invoice',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 72, right: 72, bottom: 88, left: 72 },
  footer: (
    <div tw="flex w-full items-center justify-between border-t-2 border-zinc-200 pt-3 text-[13px] text-zinc-500">
      <span>Thank you for your business!</span>
      <span tw="flex">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

const items = [
  { description: 'Web Development', qty: 1, rate: 12500 },
  { description: 'UI/UX Design', qty: 1, rate: 8750 },
  { description: 'Consulting', qty: 10, rate: 1500 },
];

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const subtotal = items.reduce((sum, it) => sum + it.qty * it.rate, 0);
const tax = subtotal * 0.07;

const rule = (i: number) => (i < items.length - 1 ? 'border-b border-zinc-200' : '');

const PartyBlock = ({ label, lines }: { label: string; lines: string[] }) => (
  <div tw="flex flex-1 flex-col pr-5">
    <span tw="mb-1 text-[12px] font-bold uppercase tracking-wider text-zinc-500">{label}</span>
    {lines.map((line) => (
      <span key={line} tw="text-[13px] leading-relaxed text-zinc-900">
        {line}
      </span>
    ))}
  </div>
);

export default function InvoiceClassic() {
  return (
    <main tw="flex flex-col text-[14px] text-zinc-900">
      <div tw="flex items-center border-b-2 border-zinc-200 pb-5">
        <div tw="mr-5 flex h-[64px] w-[64px] items-center justify-center rounded-lg bg-zinc-900">
          <span tw="text-[28px] font-bold text-white">M</span>
        </div>
        <div tw="flex flex-1 flex-col">
          <h1 tw="m-0 text-[27px] font-bold leading-tight text-zinc-900">Meridian Systems</h1>
          <span tw="mt-1 text-[14px] text-zinc-500">Software and Design Studio</span>
        </div>
        <div tw="flex flex-col items-end">
          <span tw="text-[14px] font-medium">INV-2026-001</span>
          <span tw="mt-1 text-[13px] text-zinc-500">Due: October 23, 2026</span>
        </div>
      </div>

      <div tw="my-9 flex">
        <PartyBlock
          label="From"
          lines={['Meridian Systems LLC', 'Miami, FL', 'billing@meridian.example']}
        />
        <PartyBlock
          label="Bill To"
          lines={['Harborline Logistics Inc.', '780 Port Center Drive', 'ap@harborline.example']}
        />
        <PartyBlock
          label="Payment Terms"
          lines={['ACH / Card / Wire Transfer', 'Tax ID 84-2291047', 'October 23, 2026']}
        />
      </div>

      <table tw="w-full rounded-md border-2 border-zinc-200 text-[14px]">
        <thead>
          <tr tw="bg-zinc-100 font-semibold">
            <th tw="border-b border-r border-zinc-200 px-3 py-2 text-left">Description</th>
            <th tw="border-b border-r border-zinc-200 px-3 py-2 text-center">QTY</th>
            <th tw="border-b border-r border-zinc-200 px-3 py-2 text-center">Rate</th>
            <th tw="border-b border-zinc-200 px-3 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={it.description} tw={i % 2 === 1 ? 'bg-zinc-100' : 'bg-white'}>
              <td tw={`${rule(i)} border-r border-zinc-200 px-3 py-2`}>{it.description}</td>
              <td tw={`${rule(i)} border-r border-zinc-200 px-3 py-2 text-center`}>
                {String(it.qty)}
              </td>
              <td tw={`${rule(i)} border-r border-zinc-200 px-3 py-2 text-center`}>
                {money(it.rate)}
              </td>
              <td tw={`${rule(i)} px-3 py-2 text-right`}>{money(it.qty * it.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div tw="mt-5 flex justify-end" style={{ breakInside: 'avoid' }}>
        <div tw="flex w-[290px] flex-col text-[13px]">
          <div tw="flex justify-between border-b border-zinc-200 py-1.5">
            <span tw="font-medium text-zinc-500">Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div tw="flex justify-between border-b border-zinc-200 py-1.5">
            <span tw="font-medium text-zinc-500">Tax (7%)</span>
            <span>{money(tax)}</span>
          </div>
          <div tw="flex justify-between py-1.5 text-[16px] font-bold">
            <span>Total</span>
            <span>{money(subtotal + tax)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
