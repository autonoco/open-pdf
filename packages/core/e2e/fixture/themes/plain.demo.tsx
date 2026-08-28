export default function PlainDemo() {
  return (
    <main tw="flex flex-col text-[12px] text-slate-800">
      <h1 tw="text-[32px] font-bold">Theme demo one</h1>
      <p tw="mt-4">Minimal fixture theme demo.</p>
      <div tw="flex flex-col" style={{ breakBefore: 'page' }}>
        <h1 tw="text-[32px] font-bold">Theme demo two</h1>
      </div>
    </main>
  );
}
