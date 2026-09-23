import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Consultant Invoice',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 72, right: 72, bottom: 88, left: 72 },
  footer: (
    <div tw="flex w-full items-center justify-between border-t-2 border-zinc-200 pt-3 text-[13px] text-zinc-500">
      <span>Professional services invoice. Please retain for your records.</span>
      <span tw="flex">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

const services = [
  { description: 'Architecture Review & Planning', hours: 16, rate: 175 },
  { description: 'Code Review & Optimization', hours: 24, rate: 150 },
  { description: 'Technical Documentation', hours: 12, rate: 125 },
  { description: 'Team Training & Knowledge Transfer', hours: 8, rate: 200 },
];

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const totalHours = services.reduce((sum, s) => sum + s.hours, 0);
const subtotal = services.reduce((sum, s) => sum + s.hours * s.rate, 0);
const tax = subtotal * 0.05;

const Party = ({ label, name, lines }: { label: string; name: string; lines: string[] }) => (
  <div tw="flex flex-1 flex-col">
    <span tw="mb-2 border-b border-zinc-200 pb-1 text-[12px] font-bold uppercase tracking-wider text-zinc-900">
      {label}
    </span>
    <span tw="text-[16px] font-semibold leading-snug">{name}</span>
    {lines.map((line) => (
      <span key={line} tw="text-[13px] leading-relaxed text-zinc-500">
        {line}
      </span>
    ))}
  </div>
);

export default function InvoiceConsultant() {
  return (
    <main tw="flex flex-col text-[14px] text-zinc-900">
      <div tw="flex items-start justify-between border-b-2 border-zinc-900 pb-5">
        <div tw="flex flex-1 flex-col">
          <h1 tw="m-0 text-[29px] font-bold leading-tight">Meridian Advisory</h1>
          <span tw="text-[16px] text-zinc-500">Professional Consulting Services</span>
          <span tw="text-[13px] text-zinc-500">Miami, FL · hello@meridian.example</span>
        </div>
        <div tw="flex flex-col items-end">
          <span tw="text-[13px] uppercase tracking-wider text-zinc-500">Invoice</span>
          <span tw="text-[24px] font-bold leading-tight">INV-2026-006</span>
          <span tw="text-[13px] text-zinc-500">September 23, 2026</span>
          <span tw="text-[13px] text-zinc-500">Due: October 23, 2026</span>
        </div>
      </div>

      <div tw="mt-9 flex items-center rounded-sm bg-zinc-100 px-3 py-2 text-[13px]">
        <span tw="mr-2 font-semibold text-zinc-500">Project Reference:</span>
        <span tw="font-bold">PROJ-2026-HBL-014</span>
      </div>

      <div tw="mt-9 flex gap-[53px]">
        <Party
          label="From (Consultant)"
          name="Jordan Ellis"
          lines={['Senior Technical Consultant', 'jordan.ellis@meridian.example']}
        />
        <Party
          label="Bill To (Client)"
          name="Priya Raman"
          lines={[
            'Harborline Logistics Inc.',
            '780 Port Center Drive, Savannah, GA',
            'priya.raman@harborline.example',
          ]}
        />
      </div>

      <table tw="mt-9 w-full text-[14px]">
        <thead>
          <tr tw="font-semibold">
            <th tw="border-b-2 border-zinc-200 px-3 py-2 text-left">Service Description</th>
            <th tw="border-b-2 border-zinc-200 px-3 py-2 text-center">Hours</th>
            <th tw="border-b-2 border-zinc-200 px-3 py-2 text-right">Rate ($/hr)</th>
            <th tw="border-b-2 border-zinc-200 px-3 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.description}>
              <td tw="border-b border-zinc-200 px-3 py-2">{s.description}</td>
              <td tw="border-b border-zinc-200 px-3 py-2 text-center">{String(s.hours)}</td>
              <td tw="border-b border-zinc-200 px-3 py-2 text-right">{money(s.rate)}</td>
              <td tw="border-b border-zinc-200 px-3 py-2 text-right">{money(s.hours * s.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div tw="mt-7 flex" style={{ breakInside: 'avoid' }}>
        <div tw="flex flex-1 flex-col items-start pr-8">
          <span tw="rounded-sm bg-zinc-900 px-4 py-2 text-[12px] font-bold text-white">
            Total Hours: {String(totalHours)}
          </span>
          <span tw="mt-3 text-[13px] text-zinc-500">Payment: Bank Transfer / Check</span>
        </div>
        <div tw="flex w-[333px] flex-col text-[13px]">
          <div tw="flex justify-between border-b border-zinc-200 py-1.5">
            <span tw="font-medium text-zinc-500">Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div tw="flex justify-between border-b border-zinc-200 py-1.5">
            <span tw="font-medium text-zinc-500">Tax (5%)</span>
            <span>{money(tax)}</span>
          </div>
          <div tw="flex items-center justify-between py-1.5">
            <span tw="text-[17px] font-bold">Amount Due</span>
            <span tw="text-[19px] font-bold">{money(subtotal + tax)}</span>
          </div>
        </div>
      </div>

      <div tw="mt-5 flex border-l-4 border-sky-500 bg-zinc-100 py-3 pl-4 pr-4 text-[13px] text-zinc-500">
        <p>Services rendered for September 2026. All hours verified and approved by client.</p>
      </div>
    </main>
  );
}
