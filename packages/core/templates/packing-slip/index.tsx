import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Packing Slip',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 56, right: 56, bottom: 72, left: 56 },
  footer: (
    <div tw="flex w-full items-center justify-between border-t-2 border-zinc-200 pt-3 text-[10px] text-zinc-500">
      <span>support@fernbrook-supply.example</span>
      <span tw="flex">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

const items = [
  { name: 'Trail Lantern Pro', sku: 'TL-001', qtyOrdered: 2, qtyPacked: 2, unitPrice: 49.99 },
  { name: 'Pocket Stove Lite', sku: 'PS-010', qtyOrdered: 1, qtyPacked: 1, unitPrice: 29.99 },
  { name: 'Paracord Kit', sku: 'PK-204', qtyOrdered: 3, qtyPacked: 2, unitPrice: 9.5 },
];

const money = (n: number) => `$${n.toFixed(2)}`;

const totalPacked = items.reduce((s, it) => s + it.qtyPacked, 0);
const totalOrdered = items.reduce((s, it) => s + it.qtyOrdered, 0);

const Label = ({ children }: { children: string }) => (
  <h2 tw="m-0 mb-[2px] text-[9px] font-bold uppercase text-zinc-500">{children}</h2>
);

const Summary = ({ label, value }: { label: string; value: string }) => (
  <div tw="flex justify-between border-b border-zinc-200 py-[6px] text-[12px]">
    <span tw="text-zinc-500">{label}</span>
    <span tw="font-medium">{value}</span>
  </div>
);

const head = 'px-[10px] py-[6px]';
const cell = 'border-b border-r border-zinc-200 px-[10px] py-[6px]';

export default function PackingSlip() {
  return (
    <main tw="flex flex-col text-[11px] leading-normal text-zinc-900">
      <div tw="flex items-center border-b-2 border-zinc-200 pb-4">
        <div tw="flex flex-1 flex-col">
          <h1 tw="m-0 text-[20px] font-bold leading-tight">PACKING SLIP</h1>
          <p tw="m-0 mt-1 text-zinc-500">Fernbrook Supply Co.</p>
        </div>
        <div tw="flex flex-col items-end">
          <span tw="font-medium">ORD-2026-0891</span>
          <span tw="mt-1 text-[10px] text-zinc-500">Order Date: Sep 10, 2026</span>
        </div>
      </div>

      <section tw="my-7 flex text-[10px]" style={{ breakInside: 'avoid' }}>
        <div tw="flex flex-1 flex-col pr-[15px]">
          <Label>Ship To</Label>
          <span>Jane Marlow</span>
          <span>456 Oak Ave, Portland, OR 97201</span>
          <span>(503) 555-0142</span>
        </div>
        <div tw="flex flex-1 flex-col pr-[15px]">
          <Label>From</Label>
          <span>Fernbrook Warehouse</span>
          <span>100 Industrial Blvd, Seattle, WA 98101</span>
        </div>
        <div tw="flex flex-1 flex-col pr-[15px]">
          <Label>Order</Label>
          <span>ORD-2026-0891</span>
          <span>PO: PO-4471</span>
        </div>
      </section>

      <table tw="w-full overflow-hidden rounded border-[1.5px] border-zinc-200 text-[11px]">
        <thead>
          <tr tw="border-b border-zinc-200 bg-zinc-100 font-semibold">
            <th tw={`${head} text-left`}>Item</th>
            <th tw={`${head} text-center`}>SKU</th>
            <th tw={`${head} text-center`}>Packed</th>
            <th tw={`${head} text-center`}>Ordered</th>
            <th tw={`${head} text-right`}>Unit Price</th>
            <th tw="px-[10px] py-[6px] text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={it.sku} tw={`${i % 2 === 1 ? 'bg-zinc-100' : 'bg-white'}`}>
              <td tw={cell}>{it.name}</td>
              <td tw={`${cell} text-center`}>{it.sku}</td>
              <td tw={`${cell} text-center`}>{String(it.qtyPacked)}</td>
              <td tw={`${cell} text-center`}>{String(it.qtyOrdered)}</td>
              <td tw={`${cell} text-right`}>{money(it.unitPrice)}</td>
              <td tw="border-b border-zinc-200 px-[10px] py-[6px] text-right">
                {money(it.qtyPacked * it.unitPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section tw="mt-4 flex items-start" style={{ breakInside: 'avoid' }}>
        <div tw="flex flex-1 flex-col pr-[15px] text-[10px]">
          <Label>Shipping</Label>
          <span>Parcel Express, Ground</span>
          <span>Tracking: PX7730019842265</span>
          <span>Est. Delivery: Sep 15, 2026</span>
        </div>
        <div tw="flex w-[220px] flex-col">
          <Summary label="Items Packed" value={`${totalPacked} of ${totalOrdered}`} />
          <Summary label="Packages" value="1" />
          <Summary label="Total Weight" value="3.2 kg" />
        </div>
      </section>

      <section
        tw="mt-4 flex flex-col border-l-4 border-emerald-600 bg-zinc-100 p-4"
        style={{ breakInside: 'avoid' }}
      >
        <span tw="text-[12px] font-medium">Thank you for your order!</span>
        <span tw="text-[10px] text-zinc-500">
          Returns accepted within 30 days with original packaging.
        </span>
      </section>
    </main>
  );
}
