import type { DocMeta, PageOptions } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Shipping Label',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: { width: 384, height: 576 },
  margin: 11,
};

const details = [
  { key: 'Weight', value: '2.5 kg' },
  { key: 'Dimensions', value: '12" x 8" x 6"' },
  { key: 'Packages', value: '1' },
  { key: 'Postage', value: '$18.40' },
];

const rule = (i: number) => (i < details.length - 1 ? 'border-b border-zinc-200' : '');

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
    tw={`absolute left-[${x * 5}px] top-[${y * 5}px] flex h-[35px] w-[35px] items-center justify-center border-[5px] border-black`}
  >
    <div tw="h-[15px] w-[15px] bg-black" />
  </div>
);

const QrPlaceholder = () => (
  <div tw="relative flex h-[105px] w-[105px]">
    <Finder x={0} y={0} />
    <Finder x={14} y={0} />
    <Finder x={0} y={14} />
    {qrModules.map(([x, y, w, h]) => (
      <div
        key={`${x}-${y}`}
        tw={`absolute left-[${x * 5}px] top-[${y * 5}px] h-[${h * 5}px] w-[${w * 5}px] bg-black`}
      />
    ))}
  </div>
);

const SectionLabel = ({ children }: { children: string }) => (
  <span tw="mb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-900">{children}</span>
);

const Address = ({ lines, phone }: { lines: [string, string, string]; phone?: string }) => (
  <div tw="flex flex-col text-[13px] leading-snug">
    <span tw="font-bold">{lines[0]}</span>
    <span>{lines[1]}</span>
    <span>{lines[2]}</span>
    {phone && <span tw="text-zinc-500">{phone}</span>}
  </div>
);

export default function ShippingLabel() {
  return (
    <main tw="flex h-[554px] flex-col border-2 border-zinc-900 p-[13px] text-zinc-900">
      <div tw="flex items-center justify-between">
        <span tw="text-[21px] font-bold">SWIFTSHIP</span>
        <span tw="text-[11px] font-bold uppercase tracking-wider">Ground</span>
      </div>
      <div tw="my-2 h-[2px] bg-zinc-900" />

      <div tw="flex flex-1">
        <div tw="flex flex-[1.4] flex-col border-r-2 border-zinc-900 pr-4">
          <SectionLabel>Ship To</SectionLabel>
          <Address
            lines={['Jordan Rivera', '123 Main Street, Apt 4B', 'Brooklyn, NY 11201, USA']}
            phone="(503) 555-0142"
          />
        </div>
        <div tw="flex flex-1 flex-col pl-4">
          <SectionLabel>From</SectionLabel>
          <Address
            lines={['Meridian Supply Co.', '456 Industrial Blvd', 'Los Angeles, CA 90001, USA']}
          />
        </div>
      </div>
      <div tw="my-2 h-[2px] bg-zinc-900" />

      <table tw="w-full border-2 border-zinc-900 text-[13px]">
        <tbody>
          {details.map((row, i) => (
            <tr key={row.key}>
              <td
                tw={`${rule(i)} w-[112px] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-zinc-500`}
              >
                {row.key}
              </td>
              <td tw={`${rule(i)} px-2.5 py-1`}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div tw="mt-2.5 flex gap-2">
        <span tw="bg-zinc-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
          Fragile
        </span>
        <span tw="bg-zinc-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
          This side up
        </span>
      </div>

      <div tw="mt-3 flex flex-col items-center">
        <QrPlaceholder />
        <span tw="mt-2 text-[13px] font-bold uppercase tracking-[2.6px]">
          SWS 1Z84 2210 9031 US
        </span>
      </div>
    </main>
  );
}
