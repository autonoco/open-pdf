import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Meeting Minutes',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 56, right: 56, bottom: 72, left: 56 },
  footer: (
    <div tw="flex w-full items-center justify-between border-t-2 border-zinc-200 pt-3 text-[10px] text-zinc-500">
      <span>Prepared by Alex Kim · Distribution: product-team@northwind.example</span>
      <span tw="flex">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

type Status = 'Complete' | 'In Progress' | 'Not Started';

const attendeeColumns = [
  {
    heading: 'Attendees',
    names: ['Alex Kim, Product Lead', 'Jordan Lee, Engineering Lead', 'Sam Patel, Design Lead'],
  },
  { heading: 'Absent', names: ['Casey Wu, QA Lead'] },
  { heading: 'Guests', names: ['Riya Shah (Advisor)'] },
];

const agenda = [
  'Review Q2 outcomes',
  'Q3 feature priorities',
  'Resource allocation',
  'Timeline and milestones',
];

const decisions = [
  {
    number: 1,
    decision: 'Adopt the new rendering engine as the second export target',
    rationale: 'Better JSX support and faster cold starts',
  },
  { number: 2, decision: 'Allocate 2 engineers to the export module full-time' },
];

const actionItems: { task: string; owner: string; due: string; status: Status }[] = [
  {
    task: 'Draft rendering engine integration RFC',
    owner: 'Jordan Lee',
    due: 'Sep 19, 2026',
    status: 'In Progress',
  },
  {
    task: 'Design community page wireframes',
    owner: 'Sam Patel',
    due: 'Sep 22, 2026',
    status: 'Not Started',
  },
  {
    task: 'Share Q2 outcomes deck with stakeholders',
    owner: 'Alex Kim',
    due: 'Sep 26, 2026',
    status: 'Complete',
  },
];

const statusStyle: Record<Status, string> = {
  Complete: 'border-green-600 text-green-600',
  'In Progress': 'border-sky-500 text-sky-500',
  'Not Started': 'border-zinc-200 text-zinc-500',
};

const Label = ({ children }: { children: string }) => (
  <h2 tw="m-0 mb-[2px] text-[9px] font-bold uppercase text-zinc-500">{children}</h2>
);

const Bullets = ({ items }: { items: string[] }) => (
  <ul tw="m-0 mt-1 flex flex-col p-0">
    {items.map((item) => (
      <li key={item} tw="mb-1 flex items-start">
        <span tw="mt-[6px] flex w-4 shrink-0 justify-center">
          <span tw="h-[5px] w-[5px] rounded-full bg-zinc-900" />
        </span>
        <span tw="flex-1">{item}</span>
      </li>
    ))}
  </ul>
);

const Discussion = ({
  topic,
  speaker,
  notes,
}: {
  topic: string;
  speaker: string;
  notes: string[];
}) => (
  <div tw="mb-2 flex flex-col" style={{ breakInside: 'avoid' }}>
    <h3 tw="m-0 text-[12px] font-semibold">{topic}</h3>
    <span tw="text-[10px] text-zinc-500">{speaker}</span>
    <Bullets items={notes} />
  </div>
);

export default function MeetingMinutes() {
  return (
    <main tw="flex flex-col text-[11px] leading-normal text-zinc-900">
      <div tw="flex items-start justify-between border-b-2 border-zinc-200 pb-4">
        <div tw="flex flex-1 flex-col">
          <h1 tw="m-0 text-[20px] font-bold leading-tight">Q3 Product Roadmap Review</h1>
          <p tw="m-0 mt-1 text-zinc-500">Conference Room B / Video call · Organized by Alex Kim</p>
        </div>
        <div tw="flex flex-col items-end">
          <span tw="font-medium">September 12, 2026</span>
          <span tw="mt-1 text-[10px] text-zinc-500">2:00 PM - 3:30 PM</span>
        </div>
      </div>

      <section tw="mt-4 flex">
        {attendeeColumns.map((col) => (
          <div key={col.heading} tw="flex flex-1 flex-col pr-[15px]">
            <Label>{col.heading}</Label>
            {col.names.map((name) => (
              <span key={name} tw="text-[10px]">
                {name}
              </span>
            ))}
          </div>
        ))}
      </section>

      <section tw="mt-4 flex flex-col">
        <Label>Agenda</Label>
        <ol tw="m-0 flex flex-col p-0 text-[12px]">
          {agenda.map((item, i) => (
            <li key={item} tw="mb-1 flex">{`${i + 1}. ${item}`}</li>
          ))}
        </ol>
      </section>

      <section tw="mt-4 flex flex-col text-[12px]">
        <Label>Discussion</Label>
        <Discussion
          topic="Q2 Outcomes"
          speaker="Alex Kim"
          notes={['Shipped 4 of 5 planned features', 'Customer satisfaction up 12%']}
        />
        <Discussion
          topic="Q3 Feature Priorities"
          speaker="Jordan Lee"
          notes={['Export module is the top priority', 'Community page scheduled for late Q3']}
        />
      </section>

      <section tw="flex flex-col" style={{ breakBefore: 'page' }}>
        <Label>Decisions</Label>
        {decisions.map((d) => (
          <div key={d.number} tw="mb-2 flex flex-col">
            <span tw="text-[12px] font-semibold">{`${d.number}. ${d.decision}`}</span>
            {d.rationale ? <span tw="text-[10px] text-zinc-500">{d.rationale}</span> : null}
          </div>
        ))}
      </section>

      <section tw="mt-4 flex flex-col">
        <Label>Action Items</Label>
        <table tw="w-full overflow-hidden rounded border-[1.5px] border-zinc-200 text-[11px]">
          <thead>
            <tr tw="border-b border-zinc-200 bg-zinc-100 font-semibold">
              <th tw="px-[10px] py-[6px] text-left">Task</th>
              <th tw="px-[10px] py-[6px] text-center">Owner</th>
              <th tw="px-[10px] py-[6px] text-center">Due Date</th>
              <th tw="px-[10px] py-[6px] text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {actionItems.map((item, i) => (
              <tr key={item.task} tw={`${i % 2 === 1 ? 'bg-zinc-100' : 'bg-white'}`}>
                <td tw="border-b border-r border-zinc-200 px-[10px] py-[6px]">{item.task}</td>
                <td tw="border-b border-r border-zinc-200 px-[10px] py-[6px] text-center">
                  {item.owner}
                </td>
                <td tw="border-b border-r border-zinc-200 px-[10px] py-[6px] text-center">
                  {item.due}
                </td>
                <td tw="border-b border-zinc-200 px-[10px] py-[6px]">
                  <div tw="flex justify-center">
                    <span
                      tw={`flex rounded-full border bg-zinc-100 px-2 py-[1px] text-[9px] font-semibold tracking-wide ${statusStyle[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section
        tw="mt-4 flex flex-col border-l-4 border-cyan-600 bg-zinc-100 p-4 text-[12px]"
        style={{ breakInside: 'avoid' }}
      >
        <Label>Next Meeting</Label>
        <span tw="font-medium">September 19, 2026 · 2:00 PM</span>
        <Bullets items={['Review action items', 'Rendering engine RFC walkthrough']} />
      </section>
    </main>
  );
}
