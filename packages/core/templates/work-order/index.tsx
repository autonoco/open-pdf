import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Work Order',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 56, right: 56, bottom: 72, left: 56 },
  footer: (
    <div tw="flex w-full items-center justify-between border-t-2 border-zinc-200 pt-3 text-[10px] text-zinc-500">
      <span>90-day warranty on parts and labor.</span>
      <span tw="flex">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

const parts = [
  { partNumber: 'PUMP-001', description: 'Drain Pump Assembly', qty: 1, unitPrice: 89.99 },
  { partNumber: 'HOSE-012', description: 'Drain Hose Kit', qty: 1, unitPrice: 24.5 },
];

const labor = [
  { description: 'Diagnosis and repair', technician: 'Mike Torres', hours: 2.5, rate: 95 },
];

const taxRate = 0.0825;
const partsTotal = parts.reduce((s, p) => s + p.qty * p.unitPrice, 0);
const laborTotal = labor.reduce((s, l) => s + l.hours * l.rate, 0);
const tax = (partsTotal + laborTotal) * taxRate;
const grandTotal = partsTotal + laborTotal + tax;

const money = (n: number) => `$${n.toFixed(2)}`;

const head = 'px-[10px] py-[6px]';
const cell = 'border-b border-r border-zinc-200 px-[10px] py-[6px]';

const Label = ({ children }: { children: string }) => (
  <h2 tw="m-0 mb-[2px] text-[9px] font-bold uppercase text-zinc-500">{children}</h2>
);

const Total = ({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) => (
  <div
    tw={`flex justify-between border-b border-zinc-200 py-[6px] ${strong ? 'text-[12px] font-bold' : 'text-[11px]'}`}
  >
    <span tw={strong ? '' : 'text-zinc-500'}>{label}</span>
    <span tw={strong ? '' : 'font-medium'}>{value}</span>
  </div>
);

const Signer = ({ label, name, date }: { label: string; name?: string; date: string }) => (
  <div tw="flex flex-1 flex-col">
    <span tw="mb-1 text-[12px] text-zinc-500">{label}</span>
    <div tw="mb-1 h-6 border-b border-zinc-900" />
    {name ? <span tw="text-[11px] font-semibold">{name}</span> : null}
    <span tw="text-[10px] text-zinc-500">{date}</span>
  </div>
);

export default function WorkOrder() {
  return (
    <main tw="flex flex-col text-[11px] leading-normal text-zinc-900">
      <div tw="flex items-center border-b-2 border-zinc-200 pb-4">
        <div tw="flex flex-1 flex-col">
          <h1 tw="m-0 text-[20px] font-bold leading-tight">Summit Field Services</h1>
          <p tw="m-0 mt-1 text-zinc-500">Work Order</p>
        </div>
        <div tw="flex flex-col items-end">
          <span tw="font-medium">WO #WO-2026-0452</span>
          <span tw="mt-1 text-[10px] text-zinc-500">Date: September 10, 2026</span>
        </div>
      </div>

      <div tw="mt-[14px] flex items-center justify-between">
        <div tw="flex items-center">
          <span tw="mr-2 text-[9px] font-bold uppercase text-zinc-500">Priority</span>
          <span tw="flex rounded-full border border-amber-600 bg-zinc-100 px-2 py-[1px] text-[9px] font-semibold tracking-wide text-amber-600">
            High
          </span>
        </div>
        <span tw="flex rounded-full border border-zinc-200 bg-white px-2 py-[1px] text-[9px] font-semibold tracking-wide">
          Repair
        </span>
      </div>

      <section tw="mt-[14px] flex text-[10px]" style={{ breakInside: 'avoid' }}>
        <div tw="flex flex-1 flex-col pr-[15px]">
          <Label>Customer</Label>
          <span>Riverside Apartments</span>
          <span>789 Elm St, Austin, TX 78701</span>
          <span>(512) 555-0199</span>
          <span>Acct #: ACC-10234</span>
        </div>
        <div tw="flex flex-1 flex-col pr-[15px]">
          <Label>Job Info</Label>
          <span>Technician: Mike Torres</span>
          <span>Job Type: Repair</span>
        </div>
        <div tw="flex flex-1 flex-col pr-[15px]">
          <Label>Equipment</Label>
          <span>Commercial Dishwasher</span>
          <span>Model CD-880 Series</span>
          <span>S/N: CD8-2024-88712</span>
          <span>Location: Kitchen, Unit 4B</span>
        </div>
      </section>

      <section tw="mt-[14px] flex flex-col">
        <Label>Parts Used</Label>
        <table tw="w-full overflow-hidden rounded border-[1.5px] border-zinc-200">
          <thead>
            <tr tw="border-b border-zinc-200 bg-zinc-100 font-semibold">
              <th tw={`${head} text-left`}>Part #</th>
              <th tw={`${head} text-left`}>Description</th>
              <th tw={`${head} text-center`}>Qty</th>
              <th tw={`${head} text-right`}>Unit Price</th>
              <th tw="px-[10px] py-[6px] text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((p, i) => (
              <tr key={p.partNumber} tw={`${i % 2 === 1 ? 'bg-zinc-100' : 'bg-white'}`}>
                <td tw={cell}>{p.partNumber}</td>
                <td tw={cell}>{p.description}</td>
                <td tw={`${cell} text-center`}>{String(p.qty)}</td>
                <td tw={`${cell} text-right`}>{money(p.unitPrice)}</td>
                <td tw="border-b border-zinc-200 px-[10px] py-[6px] text-right">
                  {money(p.qty * p.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section tw="mt-[14px] flex flex-col">
        <Label>Labor</Label>
        <table tw="w-full overflow-hidden rounded border-[1.5px] border-zinc-200">
          <thead>
            <tr tw="border-b border-zinc-200 bg-zinc-100 font-semibold">
              <th tw={`${head} text-left`}>Description</th>
              <th tw={`${head} text-left`}>Technician</th>
              <th tw={`${head} text-center`}>Hours</th>
              <th tw={`${head} text-right`}>Rate</th>
              <th tw="px-[10px] py-[6px] text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {labor.map((l, i) => (
              <tr key={l.description} tw={`${i % 2 === 1 ? 'bg-zinc-100' : 'bg-white'}`}>
                <td tw={cell}>{l.description}</td>
                <td tw={cell}>{l.technician}</td>
                <td tw={`${cell} text-center`}>{String(l.hours)}</td>
                <td tw={`${cell} text-right`}>{money(l.rate)}</td>
                <td tw="border-b border-zinc-200 px-[10px] py-[6px] text-right">
                  {money(l.hours * l.rate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section tw="mt-[14px] flex items-start" style={{ breakInside: 'avoid' }}>
        <div tw="flex flex-1 flex-col pr-[15px] text-[10px]">
          <Label>Technician Notes</Label>
          <p tw="m-0">Found clogged drain pump. Replaced pump and hose. Unit tested OK.</p>
        </div>
        <div tw="flex w-[200px] flex-col">
          <Total label="Parts Total" value={money(partsTotal)} />
          <Total label="Labor Total" value={money(laborTotal)} />
          <Total label={`Tax (${(taxRate * 100).toFixed(2)}%)`} value={money(tax)} />
          <Total label="Grand Total" value={money(grandTotal)} strong />
        </div>
      </section>

      <section tw="mt-[14px] flex flex-col text-[10px]">
        <Label>Customer Notes</Label>
        <p tw="m-0">Please service before the end-of-month lease inspection.</p>
      </section>

      <section tw="mt-7 flex flex-col" style={{ breakInside: 'avoid' }}>
        <div tw="flex" style={{ gap: 32 }}>
          <Signer label="Customer Signature" date="September 10, 2026" />
          <Signer label="Technician Signature" name="Mike Torres" date="September 10, 2026" />
        </div>
        <div tw="mt-[14px] flex items-center">
          <span tw="mr-[6px] h-[10px] w-[10px] border border-zinc-900" />
          <span tw="text-[10px]">Customer approves work performed and charges above</span>
        </div>
      </section>
    </main>
  );
}
