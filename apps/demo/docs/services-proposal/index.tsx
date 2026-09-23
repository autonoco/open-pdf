import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Q3 Services Proposal',
  createdAt: '2026-08-18T16:07:35.961Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 56, right: 64, bottom: 72, left: 64 },
  header: (
    <div tw="flex w-full items-center justify-between text-[9px] text-slate-400">
      <span>Meridian Systems LLC</span>
      <span>Confidential</span>
    </div>
  ),
  footer: (
    <div tw="flex w-full justify-center text-[9px] text-slate-400">
      <span tw="flex">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

const phases = [
  {
    phase: 'Discovery',
    weeks: '1-2',
    deliverable: 'System map, integration inventory, success metrics',
    fee: 14800,
  },
  {
    phase: 'Build',
    weeks: '3-8',
    deliverable: 'Payment integration, data pipeline, KPI dashboard',
    fee: 86400,
  },
  {
    phase: 'Hardening',
    weeks: '9-10',
    deliverable: 'Load testing to 5,000 RPS, security review, runbooks',
    fee: 21600,
  },
  {
    phase: 'Launch',
    weeks: '11-12',
    deliverable: 'Cutover plan, hypercare rotation, training sessions',
    fee: 16200,
  },
];

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const total = phases.reduce((sum, p) => sum + p.fee, 0);

const KeyValue = ({ label, value }: { label: string; value: string }) => (
  <div tw="flex justify-between border-b border-slate-100 py-1.5">
    <span tw="text-slate-500">{label}</span>
    <span tw="font-bold">{value}</span>
  </div>
);

export default function Proposal() {
  return (
    <main tw="flex flex-col text-[11.5px] leading-relaxed text-slate-800">
      <span tw="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Proposal</span>
      <h1 tw="mt-2 text-[30px] font-bold leading-tight tracking-tight text-slate-900">
        Platform Modernization, Q3 2026
      </h1>
      <p tw="mt-3 text-[12.5px] text-slate-600">
        Prepared for Harborline Logistics Inc. A twelve-week engagement to replace the legacy
        billing integration, stand up a governed data pipeline, and ship an executive KPI dashboard,
        with load-tested cutover before peak season.
      </p>

      <div tw="mt-8 flex flex-col">
        <h2 tw="border-b border-slate-200 pb-1 text-[16px] font-bold text-slate-900">
          1. Engagement summary
        </h2>
        <div tw="mt-3 flex flex-col">
          <KeyValue label="Client" value="Harborline Logistics Inc." />
          <KeyValue label="Term" value="September 1 to November 21, 2026" />
          <KeyValue label="Model" value="Fixed fee per phase, net 30" />
          <KeyValue label="Team" value="One lead engineer, one data engineer, fractional PM" />
        </div>
      </div>

      <div tw="mt-8 flex flex-col">
        <h2 tw="border-b border-slate-200 pb-1 text-[16px] font-bold text-slate-900">
          2. Phases and fees
        </h2>
        <table tw="mt-4 w-full border border-slate-300 text-[10.5px]">
          <thead>
            <tr tw="bg-slate-100 font-bold">
              <th tw="border-b border-slate-300 p-2 text-left">Phase</th>
              <th tw="border-b border-slate-300 p-2 text-left">Weeks</th>
              <th tw="border-b border-slate-300 p-2 text-left">Key deliverables</th>
              <th tw="border-b border-slate-300 p-2 text-right">Fee</th>
            </tr>
          </thead>
          <tbody>
            {phases.map((p) => (
              <tr key={p.phase}>
                <td tw="border-b border-slate-200 p-2 align-top font-bold">{p.phase}</td>
                <td tw="border-b border-slate-200 p-2 align-top">{p.weeks}</td>
                <td tw="border-b border-slate-200 p-2 align-top">{p.deliverable}</td>
                <td tw="border-b border-slate-200 p-2 text-right align-top">{money(p.fee)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div tw="mt-4 flex justify-end" style={{ breakInside: 'avoid' }}>
          <div tw="flex w-[280px] flex-col text-[11px]">
            <div tw="flex justify-between py-2 text-[14px] font-bold text-slate-900">
              <span>Total engagement</span>
              <span>{money(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div tw="flex flex-col" style={{ breakBefore: 'page' }}>
        <h2 tw="border-b border-slate-200 pb-1 text-[16px] font-bold text-slate-900">3. Terms</h2>
        <p tw="mt-3">
          Invoices are issued at the start of each phase and payable net 30. Scope changes are
          agreed in writing and billed at $185 per hour. Either party may terminate with 14 days of
          notice; completed phases and work in progress are billable at the phase rate. Deliverables
          transfer to the client on payment; Meridian retains reusable internal tooling. Both
          parties keep confidential information confidential for three years.
        </p>
        <div
          tw="mt-6 flex flex-col rounded bg-indigo-50 p-4 text-[10.5px] text-indigo-900"
          style={{ breakInside: 'avoid' }}
        >
          <span tw="font-bold">Acceptance window</span>
          <span tw="mt-1">
            This proposal and its pricing are valid through September 12, 2026. Countersign below or
            reply by email to begin scheduling.
          </span>
        </div>

        <div tw="mt-12 flex justify-between" style={{ breakInside: 'avoid' }}>
          <div tw="flex w-[45%] flex-col">
            <div tw="border-b border-slate-400 pb-8" />
            <span tw="mt-1 text-[10px] text-slate-500">Bobak Emamian, Meridian Systems LLC</span>
            <span tw="text-[10px] text-slate-400">Signature and date</span>
          </div>
          <div tw="flex w-[45%] flex-col">
            <div tw="border-b border-slate-400 pb-8" />
            <span tw="mt-1 text-[10px] text-slate-500">
              Authorized signer, Harborline Logistics
            </span>
            <span tw="text-[10px] text-slate-400">Signature and date</span>
          </div>
        </div>
      </div>
    </main>
  );
}
