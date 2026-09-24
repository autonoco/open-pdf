import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';
import logo from './assets/logo.png';

export const meta: DocMeta = {
  title: 'Invoice INV-2026-0147',
  createdAt: '2026-08-18T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 48, right: 56, bottom: 64, left: 56 },
  footer: (
    <div tw="flex w-full items-center justify-between text-[9px] text-slate-400">
      <span>Meridian Systems LLC</span>
      <span tw="flex">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

const items = [
  {
    sku: 'SVC-101',
    name: 'Discovery & scoping workshop',
    detail: 'Two-day onsite covering requirements, stakeholder interviews, and system mapping.',
    qty: 2,
    unit: 1850,
  },
  {
    sku: 'SVC-102',
    name: 'API integration development',
    detail: 'REST integration with payment provider, retry queue, and webhook fan-out handlers.',
    qty: 38,
    unit: 165,
  },
  {
    sku: 'SVC-103',
    name: 'Data pipeline buildout',
    detail: 'Nightly ELT jobs from Postgres to the warehouse with schema drift alerts.',
    qty: 24,
    unit: 175,
  },
  {
    sku: 'SVC-104',
    name: 'Dashboard implementation',
    detail: 'Executive KPI dashboard with drill-downs and scheduled email snapshots.',
    qty: 16,
    unit: 155,
  },
  {
    sku: 'LIC-201',
    name: 'Platform license (annual)',
    detail: 'Production tenant, up to 50 seats, standard SLA with 99.9% uptime.',
    qty: 1,
    unit: 12000,
  },
  {
    sku: 'LIC-202',
    name: 'Sandbox environment',
    detail: 'Isolated staging tenant refreshed weekly from anonymized production data.',
    qty: 1,
    unit: 2400,
  },
  {
    sku: 'SVC-105',
    name: 'Load testing & tuning',
    detail: 'k6 scenario suite to 5,000 RPS with query plan fixes and cache tuning.',
    qty: 12,
    unit: 190,
  },
  {
    sku: 'SVC-106',
    name: 'Security review',
    detail: 'OWASP ASVS L2 assessment, dependency audit, and remediation report.',
    qty: 10,
    unit: 210,
  },
  {
    sku: 'TRN-301',
    name: 'Admin training sessions',
    detail: 'Three remote sessions with recordings and a runbook for the ops team.',
    qty: 3,
    unit: 650,
  },
  {
    sku: 'SVC-107',
    name: 'Migration of legacy records',
    detail: 'One-time migration of 2.1M rows with validation and rollback plan.',
    qty: 1,
    unit: 4800,
  },
  {
    sku: 'SUP-401',
    name: 'Priority support retainer',
    detail: 'Monthly retainer, 4-hour response window, dedicated Slack channel.',
    qty: 3,
    unit: 950,
  },
  {
    sku: 'EXP-501',
    name: 'Travel & expenses',
    detail: 'Airfare, lodging, and ground transport for the onsite workshop, at cost.',
    qty: 1,
    unit: 1638.42,
  },
];

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const subtotal = items.reduce((sum, it) => sum + it.qty * it.unit, 0);
const tax = subtotal * 0.07;

export default function Invoice() {
  return (
    <main tw="flex flex-col text-[11px] leading-normal text-slate-800">
      <div tw="flex items-start justify-between">
        <div tw="flex flex-col">
          <span tw="text-[20px] font-bold text-slate-900">Meridian Systems LLC</span>
          <span tw="text-slate-500">2201 Biscayne Blvd, Suite 400</span>
          <span tw="text-slate-500">Miami, FL 33137</span>
          <span tw="text-slate-500">billing@meridiansystems.example</span>
        </div>
        <img src={logo} alt="Meridian Systems logo" width={64} height={64} tw="rounded-lg" />
      </div>

      <div tw="mt-8 flex items-end justify-between">
        <div tw="flex flex-col">
          <span tw="text-[10px] font-bold uppercase text-slate-500">Bill to</span>
          <span tw="mt-1 font-bold">Harborline Logistics Inc.</span>
          <span>Attn: Dana Whitfield, AP</span>
          <span>780 Port Center Drive</span>
          <span>Savannah, GA 31401</span>
        </div>
        <div tw="flex flex-col items-end">
          <span tw="text-[28px] font-bold tracking-tight text-slate-900">INVOICE</span>
          <span>Invoice #: INV-2026-0147</span>
          <span>Date: August 17, 2026</span>
          <span>Due: September 16, 2026</span>
          <span>Terms: Net 30</span>
        </div>
      </div>

      <table tw="mt-8 w-full border border-slate-300 text-[10.5px]">
        <thead>
          <tr tw="bg-slate-100 font-bold">
            <th tw="border-b border-slate-300 p-2 text-left">SKU</th>
            <th tw="border-b border-slate-300 p-2 text-left">Description</th>
            <th tw="border-b border-slate-300 p-2 text-right">Qty</th>
            <th tw="border-b border-slate-300 p-2 text-right">Unit Price</th>
            <th tw="border-b border-slate-300 p-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.sku} style={{ breakInside: 'avoid' }}>
              <td tw="border-b border-slate-200 p-2 align-top">{it.sku}</td>
              <td tw="border-b border-slate-200 p-2 align-top">
                <div tw="flex flex-col">
                  <span>{it.name}</span>
                  <span tw="text-[9px] text-slate-500">{it.detail}</span>
                </div>
              </td>
              <td tw="border-b border-slate-200 p-2 text-right align-top">{String(it.qty)}</td>
              <td tw="border-b border-slate-200 p-2 text-right align-top">{money(it.unit)}</td>
              <td tw="border-b border-slate-200 p-2 text-right align-top">
                {money(it.qty * it.unit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div tw="mt-6 flex justify-end" style={{ breakInside: 'avoid' }}>
        <div tw="flex w-[260px] flex-col text-[11px]">
          <div tw="flex justify-between py-1">
            <span tw="text-slate-500">Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div tw="flex justify-between border-b border-slate-200 py-1">
            <span tw="text-slate-500">Sales tax (7%)</span>
            <span>{money(tax)}</span>
          </div>
          <div tw="flex justify-between py-2 text-[13px] font-bold text-slate-900">
            <span>Total due</span>
            <span>{money(subtotal + tax)}</span>
          </div>
        </div>
      </div>

      <div
        tw="mt-8 flex flex-col rounded bg-slate-50 p-4 text-[10px] text-slate-600"
        style={{ breakInside: 'avoid' }}
      >
        <span tw="font-bold text-slate-700">Payment details</span>
        <span tw="mt-1">
          ACH: Routing 067000001, Account 8834412907. Reference the invoice number.
        </span>
        <span>Late payments accrue 1.5% monthly. Questions: billing@meridiansystems.example</span>
      </div>
    </main>
  );
}
