import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Monthly Operations Report',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 56, right: 48, bottom: 72, left: 48 },
  footer: (
    <div tw="flex w-full items-start justify-between border-t-2 border-zinc-200 pt-3 text-[10px] text-zinc-500">
      <span tw="flex-1 font-medium text-zinc-900">Confidential, Internal Use</span>
      <span tw="flex flex-1 justify-center">Operations Report · February 2026</span>
      <span tw="flex flex-1 justify-end">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

type Tone = 'success' | 'warning' | 'destructive' | 'info';

const tones: Record<Tone, { text: string; border: string; hex: string }> = {
  success: { text: 'text-green-600', border: 'border-green-600', hex: '#16a34a' },
  warning: { text: 'text-amber-600', border: 'border-amber-600', hex: '#d97706' },
  destructive: { text: 'text-red-600', border: 'border-red-600', hex: '#dc2626' },
  info: { text: 'text-sky-500', border: 'border-sky-500', hex: '#0ea5e9' },
};

const streams = [
  { label: 'L1 Support', owner: 'N. Mehta', status: 'On Track', progress: 91, risk: 'Low' },
  { label: 'L2 Support', owner: 'D. Chen', status: 'On Track', progress: 85, risk: 'Low' },
  { label: 'Incident Queue', owner: 'R. Walker', status: 'At Risk', progress: 66, risk: 'High' },
  {
    label: 'Automation Rollout',
    owner: 'M. Roy',
    status: 'On Track',
    progress: 77,
    risk: 'Medium',
  },
];

const throughput = [
  { label: 'Incident', value: 66 },
  { label: 'Automation', value: 77 },
  { label: 'L2 Support', value: 85 },
  { label: 'L1 Support', value: 91 },
];

const throughputMax = Math.max(...throughput.map((t) => t.value));

const highlights = [
  'SLA improved after shift rebalancing and incident triage changes.',
  'Backlog grew in week 4 on a release-related ticket surge.',
  'Incident queue remediation plan has executive sponsorship and budget.',
];

const avgProgress = Math.round(streams.reduce((s, r) => s + r.progress, 0) / streams.length);

const Badge = ({ label, tone }: { label: string; tone: Tone }) => (
  <span
    tw={`flex rounded-full border ${tones[tone].border} bg-zinc-100 px-2 py-[1px] text-[9px] font-semibold tracking-wide ${tones[tone].text}`}
  >
    {label}
  </span>
);

const Metric = ({
  label,
  value,
  trend,
  tone,
}: {
  label: string;
  value: string;
  trend: string;
  tone: Tone;
}) => (
  <div
    tw={`flex w-[48.6%] flex-col items-start rounded border border-l-[3px] border-zinc-200 p-2 ${tones[tone].border}`}
    style={{ borderTopColor: '#e4e4e7', borderRightColor: '#e4e4e7', borderBottomColor: '#e4e4e7' }}
  >
    <span tw="text-[8px] uppercase tracking-wide text-zinc-500">{label}</span>
    <span tw="mt-[2px] text-[14px] font-bold text-zinc-900">{value}</span>
    <div tw="mt-[2px] flex">
      <Badge label={trend} tone={tone} />
    </div>
  </div>
);

const Eyebrow = ({ children }: { children: string }) => (
  <h2 tw="m-0 mb-2 text-[12px] font-normal uppercase text-zinc-500">{children}</h2>
);

const KeyValue = ({ label, value }: { label: string; value: string }) => (
  <div tw="flex justify-between border-b border-zinc-200 py-[6px] text-[12px]">
    <span tw="text-zinc-500">{label}</span>
    <span tw="font-medium">{value}</span>
  </div>
);

const HorizontalBar = ({ label, value }: { label: string; value: number }) => (
  <div tw="flex h-[34px] items-center">
    <span tw="flex w-[76px] justify-end pr-2 text-[8px] text-zinc-500">{label}</span>
    <div tw="flex h-full flex-1 items-center border-l border-zinc-900">
      <div tw="h-[17px] bg-blue-600" style={{ width: `${(value / throughputMax) * 88}%` }} />
      <span tw="ml-1 text-[8px] text-zinc-900">{String(value)}</span>
    </div>
  </div>
);

export default function OperationsReport() {
  return (
    <main tw="flex flex-col text-[11px] leading-normal text-zinc-900">
      <div tw="flex items-start justify-between border-b-2 border-zinc-200 pb-4">
        <div tw="flex flex-1 flex-col">
          <h1 tw="m-0 text-[20px] font-bold leading-tight">Monthly Operations Report</h1>
          <p tw="m-0 mt-1 text-[11px] text-zinc-500">
            Operations Report · Delivery throughput, SLA adherence, and backlog visibility
          </p>
        </div>
        <div tw="flex flex-col items-end">
          <span tw="text-[11px] font-medium">February 2026</span>
          <span tw="mt-1 text-[10px] text-zinc-500">Generated February 23, 2026</span>
        </div>
      </div>

      <div tw="mt-[14px] flex items-center justify-between">
        <div tw="flex">
          <Badge label="Ops: Watch" tone="warning" />
        </div>
        <span tw="text-[10px] text-zinc-500">Author: Delivery Office</span>
      </div>

      <section
        tw="mt-7 flex flex-col rounded border-2 border-zinc-200 p-4"
        style={{ breakInside: 'avoid' }}
      >
        <Eyebrow>Executive Summary</Eyebrow>
        <div tw="flex flex-wrap justify-between" style={{ rowGap: 8 }}>
          <Metric label="Tickets Closed" value="1,284" trend="+9.8% MoM" tone="success" />
          <Metric label="SLA Hit Rate" value="96.1%" trend="+1.4 pts" tone="success" />
          <Metric label="Backlog" value="214" trend="+6.0%" tone="warning" />
          <Metric label="Escalations" value="17" trend="-18.5%" tone="success" />
        </div>
      </section>

      <section tw="flex flex-col p-4" style={{ breakBefore: 'page', breakInside: 'avoid' }}>
        <Eyebrow>Performance Trend</Eyebrow>
        <div tw="flex flex-col rounded border border-zinc-200 p-3">
          <span tw="text-[12px] font-semibold">Throughput by stream</span>
          <span tw="mb-3 text-[9px] text-zinc-500">Resolved workload distribution</span>
          <div tw="flex flex-col py-2">
            <HorizontalBar label="Incident" value={throughput[0].value} />
            <HorizontalBar label="Automation" value={throughput[1].value} />
            <HorizontalBar label="L2 Support" value={throughput[2].value} />
            <HorizontalBar label="L1 Support" value={throughput[3].value} />
          </div>
        </div>
      </section>

      <section tw="flex flex-col p-4">
        <Eyebrow>Delivery Table</Eyebrow>
        <table tw="w-full text-[10px]">
          <thead>
            <tr tw="bg-zinc-100 font-semibold">
              <th tw="border-b border-zinc-200 px-2 py-[2px] text-left">Stream</th>
              <th tw="border-b border-zinc-200 px-2 py-[2px] text-left">Owner</th>
              <th tw="border-b border-zinc-200 px-2 py-[2px] text-center">Status</th>
              <th tw="border-b border-zinc-200 px-2 py-[2px] text-right">Progress</th>
              <th tw="border-b border-zinc-200 px-2 py-[2px] text-right">Risk</th>
            </tr>
          </thead>
          <tbody>
            {streams.map((r, i) => (
              <tr key={r.label} tw={i % 2 === 1 ? 'bg-zinc-100' : 'bg-white'}>
                <td tw="border-b border-zinc-200 px-2 py-[3px]">{r.label}</td>
                <td tw="border-b border-zinc-200 px-2 py-[3px]">{r.owner}</td>
                <td tw="border-b border-zinc-200 px-2 py-[3px] text-center">{r.status}</td>
                <td tw="border-b border-zinc-200 px-2 py-[3px] text-right">{`${r.progress}%`}</td>
                <td tw="border-b border-zinc-200 px-2 py-[3px] text-right">{r.risk}</td>
              </tr>
            ))}
            <tr tw="bg-zinc-100 font-semibold">
              <td tw="border-b border-zinc-200 px-2 py-[3px]">Totals</td>
              <td tw="border-b border-zinc-200 px-2 py-[3px]">-</td>
              <td tw="border-b border-zinc-200 px-2 py-[3px] text-center">-</td>
              <td tw="border-b border-zinc-200 px-2 py-[3px] text-right">{`${avgProgress}%`}</td>
              <td tw="border-b border-zinc-200 px-2 py-[3px] text-right">-</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section
        tw="mt-7 flex flex-col rounded border-2 border-zinc-200 p-4"
        style={{ breakBefore: 'page', breakInside: 'avoid' }}
      >
        <Eyebrow>Highlights and Risks</Eyebrow>
        <div tw="flex items-start" style={{ gap: 10 }}>
          <ul tw="m-0 flex flex-1 flex-col p-0">
            {highlights.map((h) => (
              <li key={h} tw="mb-2 flex items-start text-[11px]">
                <span tw="mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-green-600">
                  <svg width={10} height={10} viewBox="0 0 10 10">
                    <title>Done</title>
                    <path d="M2 5.2 4.2 7.4 8 2.8" fill="none" stroke="#ffffff" strokeWidth={1.6} />
                  </svg>
                </span>
                <span tw="flex-1 leading-relaxed">{h}</span>
              </li>
            ))}
          </ul>
          <div tw="flex flex-1 flex-col">
            <KeyValue
              label="Open Risks"
              value={String(streams.filter((r) => r.risk !== 'Low').length)}
            />
            <KeyValue
              label="On-Track Streams"
              value={`${streams.filter((r) => r.status === 'On Track').length}/${streams.length}`}
            />
            <KeyValue label="Avg Progress" value={`${avgProgress}%`} />
          </div>
        </div>
      </section>
    </main>
  );
}
