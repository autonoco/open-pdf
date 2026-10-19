export const hasHostedEditor = import.meta.env.VITE_BUTTONS_HOSTED === 'true';

export const hasWorkerEditor = import.meta.env.VITE_BUTTONS_WORKER_EDITOR === 'true';

export function switchHostedEditor(editing: boolean): boolean {
  if (hasWorkerEditor) return false;
  const url = new URL(window.location.href);
  if (!(import.meta.env.PROD && hasHostedEditor) && url.searchParams.get('edit') !== '1')
    return false;
  if (editing) url.searchParams.set('edit', '1');
  else url.searchParams.delete('edit');
  window.location.assign(url.href);
  return true;
}
