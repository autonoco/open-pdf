import type { DocMeta, PageOptions } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Event Ticket',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: { width: 672, height: 336 },
  margin: 0,
};

const Fact = ({ label, value }: { label: string; value: string }) => (
  <div tw="flex flex-col pr-4">
    <span tw="mb-1 text-[9px] font-bold uppercase tracking-[1.6px] text-zinc-500">{label}</span>
    <span tw="text-[16px] font-bold text-zinc-900">{value}</span>
  </div>
);

const Social = ({ platform, handle }: { platform: string; handle: string }) => (
  <div tw="flex items-center text-[9px] text-zinc-500">
    <span tw="mr-1 font-bold uppercase">{platform}</span>
    <span>{handle}</span>
  </div>
);

const qrModules = [
  [9, 0, 2, 2],
  [9, 4, 3, 2],
  [8, 8, 2, 3],
  [12, 8, 3, 2],
  [17, 9, 4, 2],
  [0, 9, 3, 2],
  [5, 9, 2, 3],
  [10, 13, 2, 2],
  [14, 13, 3, 3],
  [9, 17, 3, 2],
  [9, 20, 2, 1],
  [15, 20, 2, 1],
  [19, 17, 2, 4],
];

const Finder = ({ x, y }: { x: number; y: number }) => (
  <div
    tw={`absolute left-[${x * 4}px] top-[${y * 4}px] flex h-[28px] w-[28px] items-center justify-center border-4 border-black`}
  >
    <div tw="h-[12px] w-[12px] bg-black" />
  </div>
);

const QrPlaceholder = () => (
  <div tw="relative flex h-[84px] w-[84px]">
    <Finder x={0} y={0} />
    <Finder x={14} y={0} />
    <Finder x={0} y={14} />
    {qrModules.map(([x, y, w, h]) => (
      <div
        key={`${x}-${y}`}
        tw={`absolute left-[${x * 4}px] top-[${y * 4}px] h-[${h * 4}px] w-[${w * 4}px] bg-black`}
      />
    ))}
  </div>
);

export default function EventTicket() {
  return (
    <main tw="relative flex h-[336px] w-full overflow-hidden bg-white text-zinc-900">
      <div tw="w-[11px] bg-zinc-600" />

      <div tw="flex flex-1 flex-col justify-between pb-5 pl-7 pr-6 pt-6">
        <div tw="flex flex-col">
          <div tw="mb-5 flex items-center">
            <div tw="mr-2.5 flex h-[19px] w-[19px] items-center justify-center rounded bg-zinc-900">
              <span tw="text-[10px] font-bold text-white">N</span>
            </div>
            <span tw="text-[11px] font-bold uppercase tracking-[1.5px] text-zinc-500">
              Northstar Events
            </span>
            <div tw="ml-auto flex rounded-full bg-zinc-600 px-2.5 py-1">
              <span tw="text-[9px] font-bold uppercase tracking-[1.6px] text-white">VIP</span>
            </div>
          </div>
          <h1 tw="mb-2.5 text-[35px] font-bold leading-[1.08] tracking-[-0.8px]">
            Northstar Dev Summit
          </h1>
          <span tw="text-[13px] leading-snug text-zinc-500">Harbor Convention Center</span>
          <span tw="text-[13px] leading-snug text-zinc-500">123 Bayfront Ave, Miami, FL</span>
        </div>

        <div tw="flex flex-col">
          <div tw="flex">
            <Fact label="Date" value="May 15, 2027" />
            <Fact label="Time" value="9:00 AM" />
            <Fact label="Doors" value="8:00 AM" />
            <Fact label="Seat" value="A-3-12" />
          </div>
          <div tw="mt-3 flex items-center">
            <p tw="flex-1 pr-3 text-[9px] leading-snug text-zinc-500">
              Ticket is non-transferable. All sales final. No re-entry.
            </p>
            <div tw="flex gap-3">
              <Social platform="X" handle="@northstar" />
              <Social platform="Instagram" handle="@northstar" />
            </div>
          </div>
        </div>
      </div>

      <div tw="flex w-[160px] flex-col items-center justify-between border-l-2 border-dashed border-white bg-zinc-600 px-4 pb-5 pt-6">
        <span tw="text-[9px] font-bold uppercase tracking-[2.6px] text-white">Admit one</span>
        <div tw="flex rounded-lg bg-white p-[7px]">
          <QrPlaceholder />
        </div>
        <span tw="text-[9px] font-bold uppercase tracking-[1.5px] text-white">TKT-00142</span>
      </div>

      <div tw="absolute left-[501px] top-[-11px] h-[21px] w-[21px] rounded-full bg-white" />
      <div tw="absolute bottom-[-11px] left-[501px] h-[21px] w-[21px] rounded-full bg-white" />
    </main>
  );
}
