import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Lesson Plan',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 56, right: 56, bottom: 72, left: 56 },
  footer: (
    <div tw="flex w-full items-center justify-between border-t-2 border-zinc-200 pt-3 text-[10px] text-zinc-500">
      <span>Mathematics · 8th Grade · Introduction to Linear Equations</span>
      <span tw="flex">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

const info = [
  { label: 'Subject', value: 'Mathematics' },
  { label: 'Grade Level', value: '8th Grade' },
  { label: 'Teacher', value: 'Ms. Okafor' },
  { label: 'Duration', value: '50 minutes' },
];

const objectives = [
  'Define linear equations',
  'Graph linear equations on a coordinate plane',
  'Solve simple linear equations',
];

const standards = ['CCSS.MATH.8.EE.B.6', 'CCSS.MATH.8.EE.C.7'];

const materials = ['Graph paper', 'Rulers', 'Calculator', 'Whiteboard markers'];

const sequence = [
  {
    time: '5 min',
    activity: 'Warm-up',
    description: 'Review solving one-step equations',
    notes: '5 problems on the board',
  },
  {
    time: '10 min',
    activity: 'Introduction',
    description: 'Define linear equations, show examples',
    notes: 'Use real-world context',
  },
  {
    time: '15 min',
    activity: 'Guided Practice',
    description: 'Work through 3 examples together',
    notes: 'Check for understanding',
  },
  {
    time: '15 min',
    activity: 'Independent Practice',
    description: 'Complete worksheet problems 1-10',
    notes: 'Circulate and support',
  },
  {
    time: '5 min',
    activity: 'Closure',
    description: 'Exit ticket: solve one linear equation',
    notes: 'Collect before dismissal',
  },
];

const differentiation = [
  'Provide equation mats for visual learners',
  'Allow calculator use for students with processing difficulties',
  'Offer extension problems for advanced learners',
];

const formative = ['Exit ticket', 'Observation during guided practice'];
const summative = ['Chapter quiz'];

const reflectionLines = Array.from({ length: 8 }, (_, i) => `line-${i + 1}`);

const Label = ({ children }: { children: string }) => (
  <h2 tw="m-0 mb-1 text-[9px] font-bold uppercase text-zinc-500">{children}</h2>
);

const List = ({ items, numbered = false }: { items: string[]; numbered?: boolean }) => (
  <ul tw="m-0 flex flex-col p-0">
    {items.map((item, i) => (
      <li key={item} tw="mb-[3px] flex text-[10px]">
        <span tw="w-3 shrink-0 text-zinc-500">{numbered ? `${i + 1}.` : '•'}</span>
        <span tw="flex-1">{item}</span>
      </li>
    ))}
  </ul>
);

export default function LessonPlan() {
  return (
    <main tw="flex flex-col text-[11px] leading-normal text-zinc-900">
      <div tw="flex items-start justify-between border-b-2 border-zinc-200 pb-4">
        <div tw="flex flex-1 flex-col">
          <h1 tw="m-0 text-[20px] font-bold leading-tight">Introduction to Linear Equations</h1>
          <p tw="m-0 mt-1 text-zinc-500">Lesson Plan · Linear Equations</p>
        </div>
        <span tw="font-medium">September 15, 2026</span>
      </div>

      <div tw="mt-4 flex border-b border-zinc-200 pb-3">
        {info.map((it) => (
          <div key={it.label} tw="flex flex-1 flex-col pr-[10px]">
            <Label>{it.label}</Label>
            <span tw="text-[10px] font-medium">{it.value}</span>
          </div>
        ))}
      </div>

      <div tw="mt-4 flex flex-col border-l-4 border-violet-600 bg-zinc-100 p-3">
        <Label>Essential Question</Label>
        <p tw="m-0 text-[12px] font-medium">
          How can we represent real-world relationships using linear equations?
        </p>
      </div>

      <div tw="mt-4 flex">
        <div tw="flex flex-[2] flex-col pr-5">
          <Label>Objectives</Label>
          <p tw="m-0 mb-[3px] text-[10px] text-zinc-500">Students will be able to (SWBAT):</p>
          <List items={objectives} numbered />
        </div>
        <div tw="flex flex-1 flex-col pr-[10px]">
          <Label>Standards</Label>
          <List items={standards} />
        </div>
        <div tw="flex flex-1 flex-col pr-[10px]">
          <Label>Materials</Label>
          <List items={materials} />
        </div>
      </div>

      <div tw="mt-4 flex flex-col">
        <Label>Lesson Sequence</Label>
        <table tw="w-full overflow-hidden rounded border-[1.5px] border-zinc-200 text-[11px]">
          <thead>
            <tr tw="border-b border-zinc-200 bg-zinc-100 font-semibold">
              <th tw="px-[10px] py-[6px] text-left">Time</th>
              <th tw="px-[10px] py-[6px] text-left">Activity</th>
              <th tw="px-[10px] py-[6px] text-left">Description</th>
              <th tw="px-[10px] py-[6px] text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {sequence.map((row, i) => (
              <tr key={row.activity} tw={`${i % 2 === 1 ? 'bg-zinc-100' : 'bg-white'}`}>
                <td tw="border-b border-r border-zinc-200 px-[10px] py-[6px] align-top">
                  {row.time}
                </td>
                <td tw="border-b border-r border-zinc-200 px-[10px] py-[6px] align-top">
                  {row.activity}
                </td>
                <td tw="border-b border-r border-zinc-200 px-[10px] py-[6px] align-top">
                  {row.description}
                </td>
                <td tw="border-b border-zinc-200 px-[10px] py-[6px] align-top">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div tw="flex flex-col" style={{ breakBefore: 'page' }}>
        <Label>Differentiation</Label>
        <List items={differentiation} />
      </div>

      <div tw="mt-4 flex">
        <div tw="flex flex-1 flex-col pr-5">
          <Label>Formative Assessment</Label>
          <List items={formative} />
        </div>
        <div tw="flex flex-1 flex-col pr-5">
          <Label>Summative Assessment</Label>
          <List items={summative} />
        </div>
      </div>

      <div tw="mt-4 flex flex-col">
        <Label>Homework</Label>
        <p tw="m-0 text-[10px]">Complete worksheet problems 11-20</p>
      </div>

      <div tw="mt-4 flex flex-col" style={{ breakInside: 'avoid' }}>
        <Label>Teacher Reflection</Label>
        {reflectionLines.map((key) => (
          <div key={key} tw="h-6 border-b border-zinc-200" />
        ))}
      </div>
    </main>
  );
}
