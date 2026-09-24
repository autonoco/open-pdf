import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Security Posture Report',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 56, right: 48, bottom: 72, left: 48 },
  footer: (
    <div tw="flex w-full items-start justify-between border-t-2 border-zinc-200 pt-3 text-[10px] text-zinc-500">
      <span tw="flex-1 font-medium text-zinc-900">Confidential, Internal Use</span>
      <span tw="flex flex-1 justify-center">Security Report · Sprint 05, 2026</span>
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
  { label: 'Identity Hardening', owner: 'E. Brown', status: 'On Track', progress: 87, risk: 'Low' },
  { label: 'Secrets Rotation', owner: 'P. Nair', status: 'At Risk', progress: 58, risk: 'High' },
  {
    label: 'Dependency Scanning',
    owner: 'I. Shah',
    status: 'On Track',
    progress: 81,
    risk: 'Medium',
  },
  { label: 'WAF Policy', owner: 'S. Reed', status: 'On Track', progress: 76, risk: 'Low' },
];

const riskMix = [
  { label: 'High Risk', value: 14, color: '#dc2626' },
  { label: 'Medium Risk', value: 17, color: '#f59e0b' },
  { label: 'Low Risk', value: 8, color: '#16a34a' },
  { label: 'Info', value: 4, color: '#0ea5e9' },
];

const highlights = [
  'Critical vulnerabilities reduced through mandatory patch windows.',
  'Secrets rotation remains the highest-risk stream and needs more staffing.',
  'External penetration test is scheduled next sprint to validate fixes.',
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

const donutSize = 200;
const donutR = 70;
const donutInner = donutR * 0.52;
const donutTotal = riskMix.reduce((s, d) => s + d.value, 0);

const polar = (r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: donutSize / 2 + r * Math.cos(rad), y: donutSize / 2 + r * Math.sin(rad) };
};

const arc = (start: number, end: number) => {
  const large = end - start > 180 ? 1 : 0;
  const o1 = polar(donutR, start);
  const o2 = polar(donutR, end);
  const i1 = polar(donutInner, end);
  const i2 = polar(donutInner, start);
  return `M ${o1.x} ${o1.y} A ${donutR} ${donutR} 0 ${large} 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${donutInner} ${donutInner} 0 ${large} 0 ${i2.x} ${i2.y} Z`;
};

const slices = riskMix.map((d, i) => {
  const start = (riskMix.slice(0, i).reduce((sum, x) => sum + x.value, 0) / donutTotal) * 360;
  return { ...d, start, end: start + (d.value / donutTotal) * 360 };
});

const DonutChart = () => (
  <div tw="flex items-center justify-center" style={{ gap: 32 }}>
    <div tw="relative flex" style={{ width: donutSize, height: donutSize }}>
      <svg width={donutSize} height={donutSize} viewBox={`0 0 ${donutSize} ${donutSize}`}>
        <title>Open risk distribution</title>
        {slices.map((s) => (
          <path
            key={s.label}
            d={arc(s.start, s.end)}
            fill={s.color}
            stroke="#ffffff"
            strokeWidth={1}
          />
        ))}
      </svg>
      {slices
        .filter((s) => s.end - s.start > 15)
        .map((s) => {
          const p = polar(donutR * 1.18, (s.start + s.end) / 2);
          const right = p.x > donutSize / 2;
          return (
            <span
              key={s.label}
              tw={`absolute flex w-[60px] text-[7px] text-zinc-500 ${right ? 'justify-start' : 'justify-end'}`}
              style={{ left: right ? p.x : p.x - 60, top: p.y - 5 }}
            >
              {s.label}
            </span>
          );
        })}
    </div>
    <div tw="flex flex-col" style={{ gap: 6 }}>
      {slices.map((s) => (
        <div key={s.label} tw="flex items-center text-[9px]">
          <div tw="mr-2 h-2 w-2" style={{ backgroundColor: s.color }} />
          <span tw="w-[70px] text-zinc-500">{s.label}</span>
          <span tw="font-semibold">{String(s.value)}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function SecurityReport() {
  return (
    <main tw="flex flex-col text-[11px] leading-normal text-zinc-900">
      <div tw="flex items-start justify-between border-b-2 border-zinc-200 pb-4">
        <div tw="flex flex-1 flex-col">
          <h1 tw="m-0 text-[20px] font-bold leading-tight">Security Posture Report</h1>
          <p tw="m-0 mt-1 text-[11px] text-zinc-500">
            Security Report · Vulnerability trends, control maturity, and remediation health
          </p>
        </div>
        <div tw="flex flex-col items-end">
          <span tw="text-[11px] font-medium">Sprint 05, 2026</span>
          <span tw="mt-1 text-[10px] text-zinc-500">Generated February 23, 2026</span>
        </div>
      </div>

      <div tw="mt-[14px] flex items-center justify-between">
        <div tw="flex">
          <Badge label="Security: Action Needed" tone="destructive" />
        </div>
        <span tw="text-[10px] text-zinc-500">Author: Security Engineering</span>
      </div>

      <section
        tw="mt-7 flex flex-col rounded border-2 border-zinc-200 p-4"
        style={{ breakInside: 'avoid' }}
      >
        <Eyebrow>Executive Summary</Eyebrow>
        <div tw="flex flex-wrap justify-between" style={{ rowGap: 8 }}>
          <Metric label="Critical Vulns" value="2" trend="-3 from last sprint" tone="success" />
          <Metric label="Patch SLA" value="92.0%" trend="+5.3 pts" tone="success" />
          <Metric label="Open Findings" value={String(donutTotal)} trend="+4" tone="warning" />
          <Metric label="Control Score" value="84/100" trend="+2 pts" tone="info" />
        </div>
      </section>

      <section tw="flex flex-col p-4" style={{ breakBefore: 'page', breakInside: 'avoid' }}>
        <Eyebrow>Performance Trend</Eyebrow>
        <div tw="flex flex-col rounded border border-zinc-200 p-3">
          <span tw="text-[12px] font-semibold">Open risk distribution</span>
          <span tw="mb-3 text-[9px] text-zinc-500">High, medium, and low workload share</span>
          <DonutChart />
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
