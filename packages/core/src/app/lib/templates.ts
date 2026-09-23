import { templates as raw, type TemplateMeta } from 'virtual:open-pdf/templates';

export type Template = TemplateMeta;

export const templates: Template[] = raw;

export async function createDocFromTemplate(templateId: string): Promise<string> {
  const res = await fetch(`/__templates/${encodeURIComponent(templateId)}/use`, {
    method: 'POST',
  });
  const body = (await res.json().catch(() => ({}))) as { docId?: unknown; error?: unknown };
  if (!res.ok || typeof body.docId !== 'string') {
    throw new Error(typeof body.error === 'string' ? body.error : `HTTP ${res.status}`);
  }
  return body.docId;
}
