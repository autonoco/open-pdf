import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';

export const meta: DocMeta = {
  title: 'Patient Intake Form',
  createdAt: '2026-09-23T00:00:00.000Z',
};

export const pageOptions: PageOptions = {
  size: 'a4',
  margin: { top: 48, right: 48, bottom: 72, left: 48 },
  footer: (
    <div tw="flex w-full items-start justify-between border-t-2 border-zinc-200 pt-3 text-[10px] text-zinc-500">
      <span tw="flex-1 font-medium text-zinc-900">Form v1.0 · Revised 09/2026</span>
      <span tw="flex flex-1 justify-center text-[9px]">(305) 555-0118</span>
      <span tw="flex flex-1 justify-end">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

type Field = { label: string; hint?: string; full?: boolean };

const conditions = [
  ['Diabetes', 'High Blood Pressure', 'Heart Disease', 'Asthma'],
  ['COPD', 'Cancer', 'Stroke', 'Thyroid Disorder'],
  ['Kidney Disease', 'Liver Disease', 'Seizures / Epilepsy', 'Other'],
];

const medicationRows = ['med-1', 'med-2', 'med-3', 'med-4'];
const allergyRows = ['allergy-1', 'allergy-2', 'allergy-3'];

const FormGroup = ({ title, fields }: { title: string; fields: Field[] }) => (
  <section tw="mb-5 flex flex-col" style={{ breakInside: 'avoid' }}>
    <h2 tw="m-0 mb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{title}</h2>
    <div tw="flex flex-wrap justify-between">
      {fields.map((f) => (
        <div key={f.label} tw={`mb-3 flex flex-col ${f.full ? 'w-full' : 'w-[48.5%]'}`}>
          <span tw="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            {f.label}
          </span>
          <div tw="flex h-[18px] items-end border-b border-zinc-200">
            {f.hint ? <span tw="text-[10px] text-zinc-200">{f.hint}</span> : null}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const SectionLabel = ({ children }: { children: string }) => (
  <h2 tw="m-0 mb-1 border-b border-teal-600 pb-[2px] text-[9px] font-bold uppercase tracking-wider">
    {children}
  </h2>
);

const Checkbox = ({ label }: { label: string }) => (
  <li tw="mb-1 flex items-center text-[11px]">
    <span tw="mr-2 h-4 w-4 shrink-0 rounded-[3px] border-[1.5px] border-zinc-300 bg-white" />
    <span>{label}</span>
  </li>
);

const head = 'px-[10px] py-[6px]';
const cell = 'border-b border-r border-zinc-200 px-[10px] py-[6px]';

const BlankTable = ({ headers, rows }: { headers: string[]; rows: string[] }) => (
  <table tw="w-full overflow-hidden rounded border-[1.5px] border-zinc-200 text-[11px]">
    <thead>
      <tr tw="border-b border-zinc-200 bg-zinc-100 font-semibold">
        {headers.map((h) => (
          <th key={h} tw={`${head} text-left`}>
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => (
        <tr key={row}>
          {headers.map((h, i) => (
            <td
              key={`${row}-${h}`}
              tw={i < headers.length - 1 ? cell : 'border-b border-zinc-200 px-[10px] py-[6px]'}
            >
              <div tw="h-[14px]" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

const Signer = ({ label }: { label: string }) => (
  <div tw="flex flex-1 flex-col">
    <span tw="mb-1 text-[12px] text-zinc-500">{label}</span>
    <div tw="h-6 border-b border-zinc-900" />
  </div>
);

export default function MedicalIntakeForm() {
  return (
    <main tw="flex flex-col text-[11px] leading-normal text-zinc-900">
      <div tw="mb-4 flex items-center border-b-2 border-zinc-200 pb-4">
        <div tw="flex flex-1 flex-col">
          <h1 tw="m-0 text-[20px] font-bold leading-tight">Harbor Point Family Clinic</h1>
          <p tw="m-0 mt-1 text-zinc-500">Patient Intake Form</p>
        </div>
        <div tw="flex flex-col items-end">
          <span tw="font-medium">(305) 555-0118</span>
          <span tw="mt-1 text-[10px] text-zinc-500">
            410 Bayview Ave, Suite 200, Miami, FL 33131
          </span>
        </div>
      </div>

      <FormGroup
        title="Patient Information"
        fields={[
          { label: 'Full Name' },
          { label: 'Date of Birth', hint: 'MM / DD / YYYY' },
          { label: 'Gender' },
          { label: 'Phone Number', hint: '+1 (555) 000-0000' },
          { label: 'Email Address' },
        ]}
      />
      <FormGroup
        title="Address"
        fields={[
          { label: 'Street Address', full: true },
          { label: 'City' },
          { label: 'State / Province' },
          { label: 'Postal Code' },
        ]}
      />
      <FormGroup
        title="Emergency Contact"
        fields={[
          { label: 'Emergency Contact Name' },
          { label: 'Relationship' },
          { label: 'Phone Number' },
        ]}
      />
      <FormGroup
        title="Insurance"
        fields={[
          { label: 'Insurance Provider' },
          { label: 'Policy Number' },
          { label: 'Group Number' },
          { label: 'Subscriber Name' },
        ]}
      />

      <div tw="mb-2 flex items-end justify-between" style={{ breakBefore: 'page' }}>
        <span tw="text-[13px] font-bold">
          Harbor Point Family Clinic, Patient Intake Form (continued)
        </span>
        <span tw="text-[10px] text-zinc-500">(305) 555-0118</span>
      </div>

      <section tw="mb-3 flex flex-col">
        <SectionLabel>Medical History</SectionLabel>
        <div tw="mt-1 flex" style={{ gap: 20 }}>
          {conditions.map((col) => (
            <ul key={col[0]} tw="m-0 flex flex-1 flex-col p-0">
              {col.map((c) => (
                <Checkbox key={c} label={c} />
              ))}
            </ul>
          ))}
        </div>
      </section>

      <section tw="mb-3 flex flex-col" style={{ breakInside: 'avoid' }}>
        <SectionLabel>Current Medications</SectionLabel>
        <BlankTable
          headers={['Medication', 'Dosage', 'Frequency', 'Prescribing Doctor']}
          rows={medicationRows}
        />
      </section>

      <section tw="mb-3 flex flex-col" style={{ breakInside: 'avoid' }}>
        <SectionLabel>Allergies</SectionLabel>
        <BlankTable headers={['Allergen', 'Reaction', 'Severity']} rows={allergyRows} />
      </section>

      <section tw="mb-3 flex flex-col">
        <SectionLabel>Reason for Visit</SectionLabel>
        <div tw="h-[48px] rounded-sm border border-zinc-200" />
      </section>

      <section tw="flex flex-col" style={{ breakInside: 'avoid' }}>
        <SectionLabel>Consent and Authorization</SectionLabel>
        <div tw="flex flex-col border-l-4 border-teal-600 bg-zinc-100 p-3">
          <p tw="m-0 mb-[6px] text-[10px] leading-snug text-zinc-500">
            I authorize Harbor Point Family Clinic to provide treatment and to release the
            information required to process insurance claims for this visit, and I acknowledge that
            I have received the Notice of Privacy Practices explaining how my health information may
            be used.
          </p>
          <ul tw="m-0 flex flex-col p-0">
            <Checkbox label="I have read and understand the consent above." />
            <Checkbox label="I have received the Notice of Privacy Practices." />
          </ul>
        </div>
        <div tw="mt-5 flex" style={{ gap: 32 }}>
          <Signer label="Patient / Guardian Signature" />
          <Signer label="Date" />
        </div>
      </section>
    </main>
  );
}
