import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Quarterly Financial Report',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 56, right: 48, bottom: 72, left: 48 },
  footer: (
    <div tw="flex w-full items-start justify-between border-t-2 border-zinc-200 pt-3 text-[10px] text-zinc-500">
      <span tw="flex-1 font-medium text-zinc-900">Confidential, Internal Use</span>
      <span tw="flex flex-1 justify-center">Financial Report · Q1 2026</span>
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
  { label: 'Enterprise Sales', owner: 'A. Patel', status: 'On Track', progress: 88, risk: 'Low' },
  { label: 'SMB Sales', owner: 'L. Khan', status: 'On Track', progress: 79, risk: 'Medium' },
  { label: 'Collections', owner: 'J. Reyes', status: 'At Risk', progress: 63, risk: 'High' },
  { label: 'Cost Optimization', owner: 'K. Singh', status: 'On Track', progress: 82, risk: 'Low' },
];

const series = [72, 74, 76, 77, 79, 80, 81, 83, 82, 84, 86, 88].map((value, i) => ({
  label: `W${i + 1}`,
  value,
}));

const highlights = [
  'Revenue accelerated after the enterprise expansion campaign launch.',
  'Gross margin improved on the back of an infrastructure cost renegotiation.',
  'Collections needs executive follow-up on two overdue accounts.',
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

const chartW = 600;
const chartH = 170;
const padL = 28;
const padB = 16;
const plotW = chartW - padL;
const plotH = chartH - padB;
const yMin = 70;
const yMax = 90;
const ticks = [70, 75, 80, 85, 90];
const xAt = (i: number) => padL + (i / (series.length - 1)) * plotW;
const yAt = (v: number) => plotH - ((v - yMin) / (yMax - yMin)) * plotH;

const smoothPath = (pts: { x: number; y: number }[]) =>
  pts.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const p0 = pts[i - 2] ?? pts[i - 1];
    const p1 = pts[i - 1];
    const p3 = pts[i + 1] ?? p;
    const c1x = p1.x + (p.x - p0.x) / 6;
    const c1y = p1.y + (p.y - p0.y) / 6;
    const c2x = p.x - (p3.x - p1.x) / 6;
    const c2y = p.y - (p3.y - p1.y) / 6;
    return `${d} C ${c1x} ${c1y} ${c2x} ${c2y} ${p.x} ${p.y}`;
  }, '');

const LineChart = () => (
  <div tw="relative flex" style={{ width: chartW, height: chartH }}>
    <svg
      width={chartW}
      height={chartH}
      viewBox={`0 0 ${chartW} ${chartH}`}
      tw="absolute left-0 top-0"
    >
      <title>Revenue trajectory</title>
      {ticks.map((t) => (
        <line
          key={t}
          x1={padL}
          x2={chartW}
          y1={yAt(t)}
          y2={yAt(t)}
          stroke="#e4e4e7"
          strokeWidth={0.5}
          strokeDasharray="3 3"
        />
      ))}
      <line x1={padL} x2={chartW} y1={plotH} y2={plotH} stroke="#18181b" strokeWidth={1} />
      <path
        d={smoothPath(series.map((p, i) => ({ x: xAt(i), y: yAt(p.value) })))}
        fill="none"
        stroke="#0f172a"
        strokeWidth={2}
      />
      {series.map((p, i) => (
        <circle key={p.label} cx={xAt(i)} cy={yAt(p.value)} r={3} fill="#0f172a" />
      ))}
    </svg>
    {ticks.map((t) => (
      <span
        key={t}
        tw="absolute left-0 flex w-[24px] justify-end text-[7px] text-zinc-500"
        style={{ top: yAt(t) - 5 }}
      >
        {String(t)}
      </span>
    ))}
    {series.map((p, i) => (
      <span
        key={p.label}
        tw="absolute flex w-[24px] justify-center text-[7px] text-zinc-500"
        style={{ left: xAt(i) - 12, top: plotH + 4 }}
      >
        {p.label}
      </span>
    ))}
  </div>
);

export default function FinancialReport() {
  return (
    <main tw="flex flex-col text-[11px] leading-normal text-zinc-900">
      <div tw="flex items-start justify-between border-b-2 border-zinc-200 pb-4">
        <div tw="flex flex-1 flex-col">
          <h1 tw="m-0 text-[20px] font-bold leading-tight">Quarterly Financial Report</h1>
          <p tw="m-0 mt-1 text-[11px] text-zinc-500">
            Financial Report · Revenue, margin, and expense control overview
          </p>
        </div>
        <div tw="flex flex-col items-end">
          <span tw="text-[11px] font-medium">Q1 2026</span>
          <span tw="mt-1 text-[10px] text-zinc-500">Generated February 23, 2026</span>
        </div>
      </div>

      <div tw="mt-[14px] flex items-center justify-between">
        <div tw="flex">
          <Badge label="Finance: Healthy" tone="success" />
        </div>
        <span tw="text-[10px] text-zinc-500">Author: Finance Ops</span>
      </div>

      <section
        tw="mt-7 flex flex-col rounded border-2 border-zinc-200 p-4"
        style={{ breakInside: 'avoid' }}
      >
        <Eyebrow>Executive Summary</Eyebrow>
        <div tw="flex flex-wrap justify-between" style={{ rowGap: 8 }}>
          <Metric label="Revenue" value="$2.48M" trend="+14.2% QoQ" tone="success" />
          <Metric label="Gross Margin" value="61.8%" trend="+2.1 pts" tone="success" />
          <Metric label="Opex" value="$0.93M" trend="-3.4% QoQ" tone="success" />
          <Metric label="Runway" value="22 months" trend="Stable" tone="info" />
        </div>
      </section>

      <section tw="flex flex-col p-4" style={{ breakBefore: 'page', breakInside: 'avoid' }}>
        <Eyebrow>Performance Trend</Eyebrow>
        <div tw="flex flex-col rounded border border-zinc-200 p-3">
          <span tw="text-[12px] font-semibold">Revenue trajectory</span>
          <span tw="mb-3 text-[9px] text-zinc-500">Quarterly weighted revenue index</span>
          <LineChart />
        </div>
      </section>

      <section tw="flex flex-col p-4">
        <Eyebrow>Delivery Table</Eyebrow>
        <table tw="w-full text-[10px]">
          <thead>
            <tr tw="border-b border-zinc-200 bg-zinc-100 font-semibold">
              <th tw="px-2 py-[2px] text-left">Stream</th>
              <th tw="px-2 py-[2px] text-left">Owner</th>
              <th tw="px-2 py-[2px] text-center">Status</th>
              <th tw="px-2 py-[2px] text-right">Progress</th>
              <th tw="px-2 py-[2px] text-right">Risk</th>
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
