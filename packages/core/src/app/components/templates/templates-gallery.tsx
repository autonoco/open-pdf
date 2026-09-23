import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { format, useLocale } from '@/lib/use-locale';
import { FitWidthPdfPage } from '../../lib/pdf/doc-pdf-thumb';
import { usePdfDocument } from '../../lib/pdf/pdf-viewer';
import { useTemplatePdf } from '../../lib/pdf/use-doc-pdf';
import { createDocFromTemplate, type Template, templates } from '../../lib/templates';

export function TemplatesGallery() {
  const t = useLocale();
  const [creating, setCreating] = useState<string | null>(null);

  if (templates.length === 0) {
    return (
      <p className="rounded-[10px] border border-dashed border-border bg-card/60 px-8 py-20 text-center text-[13px] text-muted-foreground">
        {import.meta.env.DEV ? t.templates.empty : t.templates.devOnly}
      </p>
    );
  }

  const use = async (template: Template) => {
    if (creating) return;
    setCreating(template.id);
    try {
      const docId = await createDocFromTemplate(template.id);
      toast.success(format(t.templates.created, { name: template.title }));
      // Full navigation: the docs registry is a virtual module that only
      // picks up the new doc on a fresh load.
      window.location.assign(`${import.meta.env.BASE_URL}s/${encodeURIComponent(docId)}`);
    } catch (err) {
      toast.error(
        format(t.templates.failed, { error: err instanceof Error ? err.message : String(err) }),
      );
      setCreating(null);
    }
  };

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(200px,100%),1fr))] gap-x-6 gap-y-9 md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
      {templates.map((template) => (
        <li key={template.id} className="min-w-0">
          <TemplateCard
            template={template}
            busy={creating === template.id}
            disabled={creating !== null}
            onUse={() => use(template)}
          />
        </li>
      ))}
    </ul>
  );
}

function TemplateCard({
  template,
  busy,
  disabled,
  onUse,
}: {
  template: Template;
  busy: boolean;
  disabled: boolean;
  onUse: () => void;
}) {
  const t = useLocale();
  return (
    <button
      type="button"
      onClick={onUse}
      disabled={disabled}
      aria-label={format(t.templates.useAria, { name: template.title })}
      className="group block w-full text-left focus-visible:outline-none disabled:cursor-progress"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] border border-hairline bg-card shadow-edge ring-1 ring-foreground/[0.04] group-hover:shadow-floating group-hover:ring-foreground/20 motion-safe:transition-[box-shadow,--tw-ring-color] motion-safe:duration-200">
        <TemplatePreview templateId={template.id} />
        <span className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-1.5 rounded-[6px] bg-foreground px-3 py-2 text-[12px] font-medium text-background opacity-0 shadow-floating group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:transition-opacity">
          {busy && <Loader2 className="size-3.5 animate-spin" />}
          {busy ? t.templates.creating : t.templates.use}
        </span>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <h3 className="min-w-0 truncate font-heading text-[14px] font-medium tracking-tight">
          {template.title}
        </h3>
        <span className="eyebrow shrink-0">{template.category}</span>
      </div>
    </button>
  );
}

function TemplatePreview({ templateId }: { templateId: string }) {
  const t = useLocale();
  const { bytes, version, error } = useTemplatePdf(templateId);
  const { doc, error: docError } = usePdfDocument(bytes, version);

  if (error || docError) {
    return (
      <div className="grid h-full w-full place-items-center bg-muted/40 px-4 text-center text-[11px] text-muted-foreground">
        {error ?? docError}
      </div>
    );
  }
  if (!doc) {
    return (
      <div className="grid h-full w-full place-items-center text-[10px] tracking-[0.08em] uppercase text-muted-foreground/60">
        {t.common.loading}
      </div>
    );
  }
  return <FitWidthPdfPage doc={doc} />;
}
