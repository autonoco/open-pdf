import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Event Agenda',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 43, right: 43, bottom: 72, left: 43 },
  footer: (
    <div tw="flex w-full items-start justify-between border-t border-zinc-200 pt-2 text-[10px] text-zinc-500">
      <div tw="flex flex-col">
        <span tw="font-semibold">Wi-Fi: Northstar-Guest / Password: summit2026</span>
        <span>Organizers Desk: +1 (305) 555-0142 | help@northstar.example</span>
      </div>
      <span tw="flex font-semibold">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

type Track = 'Platform' | 'Ecosystem' | 'Workshop';

type Session = {
  time: string;
  endTime: string;
  title: string;
  description?: string;
  speaker?: string;
  room?: string;
  track?: Track;
  isBreak?: boolean;
};

const trackStyles: Record<Track, { border: string; badge: string; dot: string }> = {
  Platform: { border: 'border-l-blue-500', badge: 'bg-blue-50 text-blue-500', dot: 'bg-blue-500' },
  Ecosystem: {
    border: 'border-l-emerald-500',
    badge: 'bg-emerald-50 text-emerald-500',
    dot: 'bg-emerald-500',
  },
  Workshop: {
    border: 'border-l-amber-500',
    badge: 'bg-amber-50 text-amber-500',
    dot: 'bg-amber-500',
  },
};

const days: { label: string; date: string; sessions: Session[] }[] = [
  {
    label: 'Day 1',
    date: 'October 20, 2026',
    sessions: [
      {
        time: '8:00 AM',
        endTime: '9:00 AM',
        title: 'Registration & Breakfast',
        description: 'Check in, grab your badge, and enjoy breakfast with peers.',
        isBreak: true,
      },
      {
        time: '9:00 AM',
        endTime: '9:45 AM',
        title: 'Opening Keynote: The Next Decade of the Web Platform',
        description: 'Recent shifts in UI engineering and the road ahead.',
        speaker: 'Elena Marsh',
        room: 'Main Hall',
        track: 'Platform',
      },
      {
        time: '10:00 AM',
        endTime: '10:45 AM',
        title: 'Server Rendering in Production',
        description: 'Architecture patterns, streaming benefits, and edge cases.',
        speaker: 'Priya Natarajan',
        room: 'Room A',
        track: 'Platform',
      },
      {
        time: '10:00 AM',
        endTime: '10:45 AM',
        title: 'State Management in 2026',
        description: 'Signals, atomic state, and server state synchronization.',
        speaker: 'Marcus Lindqvist',
        room: 'Room B',
        track: 'Ecosystem',
      },
      {
        time: '11:00 AM',
        endTime: '11:30 AM',
        title: 'Coffee & Networking Break',
        description: 'Exhibition hall coffee stations open.',
        isBreak: true,
      },
      {
        time: '11:30 AM',
        endTime: '12:15 PM',
        title: 'Building Accessible Design Systems',
        description: 'WCAG AAA compliance with composable headless components.',
        speaker: 'Hannah Okafor',
        room: 'Room A',
        track: 'Platform',
      },
      {
        time: '11:30 AM',
        endTime: '12:15 PM',
        title: 'Compiler Deep Dive: Under the Hood',
        description: 'How automatic memoization transforms rendering pipelines.',
        speaker: 'Tomas Reyes',
        room: 'Room B',
        track: 'Ecosystem',
      },
      {
        time: '12:30 PM',
        endTime: '1:45 PM',
        title: 'Catered Lunch & Sponsor Showcase',
        description: 'Lunch served in the Grand Ballroom.',
        isBreak: true,
      },
      {
        time: '2:00 PM',
        endTime: '3:30 PM',
        title: 'Interactive Workshop: Forms and Optimistic UI',
        description: 'Hands-on exercises with actions, optimistic updates, and new hooks.',
        speaker: 'Ken Adeyemi',
        room: 'Workshop Lab',
        track: 'Workshop',
      },
      {
        time: '2:00 PM',
        endTime: '3:00 PM',
        title: 'Micro-Frontends at Scale',
        description: 'Module federation across distributed product teams.',
        speaker: 'Zoe Castellanos',
        room: 'Room A',
        track: 'Ecosystem',
      },
      {
        time: '3:30 PM',
        endTime: '4:00 PM',
        title: 'Afternoon Refreshments',
        isBreak: true,
      },
      {
        time: '4:00 PM',
        endTime: '5:00 PM',
        title: 'Closing Keynote & Community Q&A',
        description: 'Day 1 highlights, open mic session, and evening preview.',
        speaker: 'Sofia Brandt',
        room: 'Main Hall',
        track: 'Platform',
      },
    ],
  },
  {
    label: 'Day 2',
    date: 'October 21, 2026',
    sessions: [
      {
        time: '8:30 AM',
        endTime: '9:30 AM',
        title: 'Welcome Coffee & Light Breakfast',
        description: 'Morning refreshments in the networking lounge.',
        isBreak: true,
      },
      {
        time: '9:30 AM',
        endTime: '10:30 AM',
        title: 'Agents and Generative Interfaces',
        description: 'How AI agents and generative UI are shaping app architecture.',
        speaker: 'Jonas Whitfield',
        room: 'Main Hall',
        track: 'Platform',
      },
      {
        time: '10:45 AM',
        endTime: '11:45 AM',
        title: 'Performance Profiling for Modern Web Apps',
        description: 'Actionable metrics, Core Web Vitals, and main-thread bottlenecks.',
        speaker: 'Amara Lewis',
        room: 'Room A',
        track: 'Platform',
      },
      {
        time: '10:45 AM',
        endTime: '11:45 AM',
        title: 'Offline-First Architecture with Local Databases',
        description: 'Sync engines, conflict resolution, and fast client-side queries.',
        speaker: 'Theo Grant',
        room: 'Room B',
        track: 'Ecosystem',
      },
      {
        time: '12:00 PM',
        endTime: '1:15 PM',
        title: 'Lunch & Community Lightning Talks',
        description: 'Quick five-minute community presentations in the theater.',
        isBreak: true,
      },
      {
        time: '1:30 PM',
        endTime: '3:00 PM',
        title: 'Hands-on Performance Optimization Workshop',
        description: 'Profiling real codebases, finding memory leaks, and trimming bundles.',
        speaker: 'Lina Haddad',
        room: 'Workshop Lab',
        track: 'Workshop',
      },
      {
        time: '3:15 PM',
        endTime: '4:15 PM',
        title: "Panel Discussion: What's Next for Developer Tooling",
        description: 'Bundlers, linters, formatters, and next-generation dev speed.',
        speaker: 'Industry Panelists',
        room: 'Main Hall',
        track: 'Ecosystem',
      },
      {
        time: '4:30 PM',
        endTime: '6:00 PM',
        title: 'Closing Reception & Networking',
        description: 'Drinks and appetizers on the convention terrace.',
        isBreak: true,
      },
    ],
  },
];

const groupByTime = (sessions: Session[]) => {
  const groups: { time: string; sessions: Session[] }[] = [];
  for (const s of sessions) {
    const last = groups[groups.length - 1];
    if (last && last.time === s.time) last.sessions.push(s);
    else groups.push({ time: s.time, sessions: [s] });
  }
  return groups;
};

const sharedEnd = (sessions: Session[]) => sessions.every((s) => s.endTime === sessions[0].endTime);

const BreakCard = ({ session }: { session: Session }) => (
  <div tw="flex flex-1 flex-col rounded-md border border-dashed border-zinc-200 bg-zinc-100 px-3 py-2">
    <div tw="flex items-center justify-between">
      <span tw="text-[13px] font-bold">{session.title}</span>
      <span tw="rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-zinc-500">
        Break
      </span>
    </div>
    {session.description && (
      <span tw="mt-0.5 text-[10px] text-zinc-500">{session.description}</span>
    )}
  </div>
);

const SessionCard = ({ session, showEnd }: { session: Session; showEnd: boolean }) => {
  const track = session.track ? trackStyles[session.track] : undefined;
  return (
    <div
      tw={`flex flex-1 flex-col rounded-md border border-zinc-200 bg-white px-3 py-2 ${track ? `border-l-4 ${track.border}` : ''}`}
    >
      <div tw="mb-1 flex items-center gap-1.5">
        {session.track && track && (
          <span tw={`rounded-sm px-2 py-px text-[9px] font-bold ${track.badge}`}>
            {session.track}
          </span>
        )}
        {session.room && (
          <span tw="rounded-sm border border-zinc-200 bg-zinc-100 px-1.5 text-[9px] font-semibold text-zinc-500">
            {session.room}
          </span>
        )}
        {showEnd && (
          <span tw="text-[9px] font-semibold text-zinc-500">until {session.endTime}</span>
        )}
      </div>
      <span tw="text-[12px] font-bold leading-tight">{session.title}</span>
      {session.speaker && (
        <span tw="mt-0.5 text-[10.5px] font-semibold text-red-600">{session.speaker}</span>
      )}
      {session.description && (
        <span tw="mt-0.5 text-[9.5px] leading-tight text-zinc-500">{session.description}</span>
      )}
    </div>
  );
};

const DaySchedule = ({ day, index }: { day: (typeof days)[number]; index: number }) => (
  <section tw="flex flex-col" style={index > 0 ? { breakBefore: 'page' } : undefined}>
    <div tw="mb-3 mt-2.5 flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-100 px-4 py-2">
      <div tw="flex items-center">
        <h2 tw="m-0 text-[15px] font-bold leading-tight">{day.label}</h2>
        <span tw="ml-2 text-[12px] text-zinc-500">{day.date}</span>
      </div>
      <span tw="text-[11px] font-semibold text-zinc-500">
        Day {String(index + 1)} of {String(days.length)}
      </span>
    </div>

    <div tw="mb-3 flex items-center gap-2">
      <span tw="mr-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500">Tracks:</span>
      {(Object.keys(trackStyles) as Track[]).map((name) => (
        <div
          key={name}
          tw="flex items-center rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5"
        >
          <div tw={`mr-1.5 h-[9px] w-[9px] rounded-full ${trackStyles[name].dot}`} />
          <span tw="text-[10px] font-semibold">{name}</span>
        </div>
      ))}
    </div>

    {groupByTime(day.sessions).map((slot) => (
      <div key={slot.time} tw="mb-2.5 flex" style={{ breakInside: 'avoid' }}>
        <div tw="flex w-[104px] flex-col pt-0.5">
          <span tw="text-[12px] font-bold">{slot.time}</span>
          {sharedEnd(slot.sessions) && (
            <span tw="text-[10px] text-zinc-500">to {slot.sessions[0].endTime}</span>
          )}
        </div>
        {slot.sessions.length === 1 && slot.sessions[0].isBreak ? (
          <BreakCard session={slot.sessions[0]} />
        ) : (
          <div tw="flex flex-1 gap-2.5">
            {slot.sessions.map((s) => (
              <SessionCard key={s.title} session={s} showEnd={!sharedEnd(slot.sessions)} />
            ))}
          </div>
        )}
      </div>
    ))}
  </section>
);

export default function EventAgenda() {
  return (
    <main tw="flex flex-col text-[12px] text-zinc-900">
      <div tw="flex justify-between border-b-2 border-zinc-200 pb-3">
        <div tw="flex flex-1 flex-col pr-5">
          <span tw="mb-0.5 text-[11px] font-bold uppercase tracking-[1.6px] text-red-600">
            Event Agenda
          </span>
          <h1 tw="mb-1 text-[27px] font-bold leading-tight">Northstar Dev Summit 2026</h1>
          <span tw="text-[11px] text-zinc-500">
            October 20 to 21, 2026 · Harbor Convention Center, Miami
          </span>
        </div>
        <div tw="flex items-center">
          <span tw="rounded bg-red-600 px-3 py-1.5 text-[13px] font-bold uppercase tracking-wider text-white">
            Agenda
          </span>
        </div>
      </div>

      {days.map((day, i) => (
        <DaySchedule key={day.label} day={day} index={i} />
      ))}
    </main>
  );
}
