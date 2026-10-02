import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Autono theme demo',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 56, right: 64, bottom: 72, left: 64 },
  fonts: [
    'https://design.autono.co/ds/fonts/DMSans-VariableFont.ttf',
    'https://design.autono.co/ds/fonts/PPMonumentExtended-Light.otf',
    'https://design.autono.co/ds/fonts/PPMonumentExtended-Regular.otf',
    'https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPQ.ttf',
  ],
  footer: (
    <div
      tw="flex w-full items-center justify-between text-[8px] uppercase tracking-[0.08em] text-[#8a827a]"
      style={{ fontFamily: 'JetBrains Mono' }}
    >
      <span>Autono · SOW-2026-014</span>
      <span tw="flex">
        <PageNumber /> / <TotalPages />
      </span>
    </div>
  ),
};

const display = { fontFamily: 'PP Monument Extended' };
const sans = { fontFamily: 'DM Sans' };
const mono = { fontFamily: 'JetBrains Mono' };

const Masthead = ({
  eyebrow,
  title,
  meta,
}: {
  eyebrow: string;
  title: string;
  meta: { label: string; value: string }[];
}) => (
  <div tw="flex flex-col rounded-[2px] bg-[#070707] px-8 pb-7 pt-6 text-[#f5f0e6]">
    <div tw="flex items-center justify-between">
      <span tw="text-[11px] tracking-[0.04em]" style={display}>
        AUTONO
      </span>
      <span tw="text-[8px] uppercase tracking-[0.18em] text-[#d4a04a]" style={display}>
        {eyebrow}
      </span>
    </div>
    <h1 tw="mb-0 mt-10 text-[26px] font-light leading-[1.1] tracking-[-0.035em]" style={display}>
      {title}
    </h1>
    <div tw="mt-6 flex border-t border-[#3a3633] pt-3">
      {meta.map((m) => (
        <div key={m.label} tw="mr-10 flex flex-col">
          <span tw="text-[8px] uppercase tracking-[0.08em] text-[#8a827a]" style={mono}>
            {m.label}
          </span>
          <span tw="mt-1 text-[10.5px] text-[#f5f0e6]">{m.value}</span>
        </div>
      ))}
    </div>
  </div>
);

const SectionHeading = ({ index, title }: { index: string; title: string }) => (
  <div tw="flex items-baseline border-b border-[#d4ccc0] pb-2">
    <span tw="mr-3 text-[9px] text-[#8b6a31]" style={mono}>
      {index}
    </span>
    <h2 tw="m-0 text-[14px] font-normal tracking-[-0.02em] text-[#070707]" style={display}>
      {title}
    </h2>
  </div>
);

const KeyValue = ({ label, value }: { label: string; value: string }) => (
  <div tw="flex justify-between border-b border-[#ece7dd] py-1.5">
    <span tw="text-[#5a534d]">{label}</span>
    <span tw="font-medium text-[#070707]">{value}</span>
  </div>
);

const Callout = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div tw="mt-8 flex rounded-[2px] bg-[#fbf8f2]" style={{ breakInside: 'avoid' }}>
    <div tw="w-[2px] bg-[#d4a04a]" />
    <div tw="flex flex-col px-4 py-3 text-[10.5px] text-[#2a2724]">
      <span tw="text-[8px] uppercase tracking-[0.18em] text-[#8b6a31]" style={display}>
        {title}
      </span>
      <div tw="mt-1.5 flex flex-col">{children}</div>
    </div>
  </div>
);

const phases = [
  {
    id: 'map',
    name: 'Map',
    detail: 'Shadow dispatchers, inventory lanes, carriers, and exception types',
    weeks: '1-2',
    fee: 18000,
  },
  {
    id: 'train',
    name: 'Train',
    detail: 'Stand up the dispatch squad on 90 days of historical loads',
    weeks: '3-5',
    fee: 42000,
  },
  {
    id: 'shadow',
    name: 'Shadow',
    detail: 'Agents propose, humans approve; measure agreement rate daily',
    weeks: '6-8',
    fee: 36000,
  },
  {
    id: 'run',
    name: 'Run',
    detail: 'Agents dispatch the Midwest lanes; humans handle escalations',
    weeks: '9-12',
    fee: 48000,
  },
];

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const total = phases.reduce((sum, p) => sum + p.fee, 0);

const th =
  'border-b border-[#d4ccc0] px-3 py-2 text-[8.5px] font-normal uppercase tracking-[0.08em] text-[#5a534d]';
const td = 'border-b border-[#ece7dd] px-3 py-2 align-top';

export default function AutonoDemo() {
  return (
    <main tw="flex flex-col text-[11px] leading-[1.55] text-[#2a2724]" style={sans}>
      <Masthead
        eyebrow="Statement of Work"
        title="Autonomous Dispatch Pilot"
        meta={[
          { label: 'Client', value: 'Northwind Freight Co.' },
          { label: 'Ref', value: 'SOW-2026-014' },
          { label: 'Issued', value: 'October 1, 2026' },
        ]}
      />

      <div tw="mt-10 flex flex-col">
        <SectionHeading index="01" title="Overview" />
        <p tw="mt-3">
          Northwind dispatches roughly 1,400 loads a week across its Midwest lanes, with four
          dispatchers working the board by hand. This pilot puts an Autono dispatch squad on those
          lanes for twelve weeks: it learns from historical loads, proposes assignments alongside
          the team, and then dispatches on its own with humans handling exceptions.
        </p>
        <p tw="mt-2">
          Success means the squad matches or beats human dispatch on on-time pickup and cost per
          mile, and the dispatch team spends its time on exceptions instead of routine assignments.
        </p>
      </div>

      <div tw="mt-10 flex flex-col">
        <SectionHeading index="02" title="Phases and fees" />
        <table tw="mt-4 w-full border border-[#d4ccc0] text-[10.5px]">
          <thead>
            <tr tw="bg-[#fbf8f2]">
              <th tw={`${th} text-left`} style={mono}>
                Phase
              </th>
              <th tw={`${th} text-left`} style={mono}>
                Weeks
              </th>
              <th tw={`${th} text-right`} style={mono}>
                Fee
              </th>
            </tr>
          </thead>
          <tbody>
            {phases.map((p) => (
              <tr key={p.id}>
                <td tw={td}>
                  <div tw="flex flex-col">
                    <span tw="font-medium text-[#070707]">{p.name}</span>
                    <span tw="text-[9.5px] text-[#5a534d]">{p.detail}</span>
                  </div>
                </td>
                <td tw={td} style={mono}>
                  {p.weeks}
                </td>
                <td tw={`${td} text-right`} style={mono}>
                  {money(p.fee)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div tw="mt-5 flex justify-end" style={{ breakInside: 'avoid' }}>
          <div tw="flex w-[240px] flex-col">
            <KeyValue label="Pilot total" value={money(total)} />
            <KeyValue label="Billing" value="Monthly, net 30" />
          </div>
        </div>
      </div>

      <Callout title="Signal">
        <span>
          The squad never dispatches a load outside its approved lanes. Any load it is unsure about
          goes to the on-shift dispatcher with its reasoning attached.
        </span>
      </Callout>

      <div tw="mt-10 flex flex-col" style={{ breakInside: 'avoid' }}>
        <SectionHeading index="03" title="Terms" />
        <div tw="mt-3 flex flex-col">
          <KeyValue label="Term" value="12 weeks from kickoff" />
          <KeyValue label="Kickoff" value="November 2, 2026" />
          <KeyValue label="Data access" value="Read-only TMS and carrier APIs" />
          <KeyValue label="Exit" value="Either party, 14 days written notice" />
        </div>
      </div>
    </main>
  );
}
