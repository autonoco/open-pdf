import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Fragment, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { format, useLocale } from '@/lib/use-locale';
import { cn } from '@/lib/utils';
import { docsByTheme, loadDoc } from '../../lib/docs';
import { DocPdfThumb, FitWidthPdfPage } from '../../lib/pdf/doc-pdf-thumb';
import { usePdfDocument } from '../../lib/pdf/pdf-viewer';
import { useThemeDemoPdf } from '../../lib/pdf/use-doc-pdf';
import type { DocModule } from '../../lib/sdk';
import { themes } from '../../lib/themes';

export function ThemeDetail({ themeId, onBack }: { themeId: string; onBack: () => void }) {
  const t = useLocale();
  const theme = useMemo(() => themes.find((th) => th.id === themeId), [themeId]);
  const [pageIndex, setPageIndex] = useState(0);

  const { bytes, version, error: workerError } = useThemeDemoPdf(themeId, theme?.hasDemo ?? false);
  const { doc: pdfDoc, error: docError } = usePdfDocument(bytes, version);
  const error = workerError ?? docError;
  const totalPages = pdfDoc?.numPages ?? 0;

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset the page when the theme changes
  useEffect(() => {
    setPageIndex(0);
  }, [themeId]);

  const usedByDocIds = useMemo(() => (theme ? docsByTheme(theme.id) : []), [theme]);

  const promptRef = useRef<HTMLPreElement>(null);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [promptOverflows, setPromptOverflows] = useState(false);

  const themeBody = theme?.body;
  useEffect(() => {
    setPromptExpanded(false);
    const el = promptRef.current;
    if (!el || !themeBody) return;
    setPromptOverflows(el.scrollHeight > PROMPT_COLLAPSED_PX + 8);
  }, [themeBody]);

  useEffect(() => {
    if (totalPages <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setPageIndex((i) => Math.min(totalPages - 1, i + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setPageIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [totalPages]);

  if (!theme) {
    return (
      <div className="px-8 py-12">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="size-4" />
          {t.themes.backToGallery}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
          <ChevronLeft className="size-4" />
          {t.themes.backToGallery}
        </Button>
      </div>

      <header className="flex flex-wrap items-baseline gap-3">
        <h2 className="font-heading text-[26px] font-semibold leading-[1.05] tracking-[-0.025em] md:text-[32px]">
          {theme.name}
        </h2>
        {theme.description ? (
          <p className="basis-full text-[13px] leading-relaxed text-muted-foreground">
            {theme.description}
          </p>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="relative aspect-video overflow-hidden rounded-[8px] border border-hairline bg-card shadow-edge ring-1 ring-foreground/[0.04]">
              {!theme.hasDemo ? (
                <NoDemoLargeState />
              ) : error ? (
                <div className="grid h-full w-full place-items-center bg-muted/40 px-8 text-center">
                  <p className="max-w-md font-mono text-[11px] leading-relaxed text-destructive">
                    {error}
                  </p>
                </div>
              ) : !pdfDoc ? (
                <div className="grid h-full w-full place-items-center text-[11px] tracking-[0.08em] uppercase text-muted-foreground/60">
                  {t.common.loading}
                </div>
              ) : (
                <FitWidthPdfPage doc={pdfDoc} pageNumber={pageIndex + 1} />
              )}
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  aria-label={t.themes.prevPageAria}
                  disabled={pageIndex === 0}
                  onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                  className="flex size-8 items-center justify-center rounded-[6px] border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="folio">
                  {format(t.themes.pageOf, { n: pageIndex + 1, total: totalPages })}
                </span>
                <button
                  type="button"
                  aria-label={t.themes.nextPageAria}
                  disabled={pageIndex === totalPages - 1}
                  onClick={() => setPageIndex((i) => Math.min(totalPages - 1, i + 1))}
                  className="flex size-8 items-center justify-center rounded-[6px] border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:opacity-40"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <pre
              ref={promptRef}
              style={
                promptOverflows && !promptExpanded ? { maxHeight: PROMPT_COLLAPSED_PX } : undefined
              }
              className={cn(
                'w-full rounded-[8px] border border-hairline bg-card p-4 font-mono text-[11.5px] leading-relaxed text-foreground/90',
                promptOverflows && !promptExpanded ? 'overflow-hidden' : 'overflow-auto',
              )}
            >
              {renderBodyWithSwatches(theme.body)}
            </pre>
            {promptOverflows && !promptExpanded ? (
              <button
                type="button"
                aria-label={t.themes.expandPromptAria}
                onClick={() => setPromptExpanded(true)}
                className="absolute inset-x-0 bottom-0 flex h-24 items-end justify-center rounded-b-[8px] bg-gradient-to-t from-card via-card/85 to-transparent pb-3 text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronDown className="size-4" />
              </button>
            ) : null}
            {promptOverflows && promptExpanded ? (
              <div className="mt-2 flex justify-center">
                <button
                  type="button"
                  aria-label={t.themes.collapsePromptAria}
                  onClick={() => setPromptExpanded(false)}
                  className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ChevronDown className="size-4 rotate-180" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="eyebrow">{t.themes.usedBy}</span>
            {usedByDocIds.length > 0 ? (
              <span className="folio">{usedByDocIds.length.toString().padStart(2, '0')}</span>
            ) : null}
          </div>
          {usedByDocIds.length === 0 ? (
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">
              {t.themes.usedByEmpty}
            </p>
          ) : (
            <ul className="flex flex-col gap-5">
              {usedByDocIds.map((id) => (
                <li key={id}>
                  <ThemeDocCard id={id} />
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

function ThemeDocCard({ id }: { id: string }) {
  const [doc, setDoc] = useState<DocModule | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadDoc(id)
      .then((mod) => {
        if (!cancelled) setDoc(mod);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  const displayTitle = doc?.meta?.title ?? id;

  return (
    <Link to={`/s/${id}`} className="group block focus-visible:outline-none">
      <div className="relative aspect-video overflow-hidden rounded-[6px] border border-hairline bg-card shadow-edge ring-1 ring-foreground/[0.04] group-hover:shadow-floating group-hover:ring-foreground/20 motion-safe:transition-[box-shadow,--tw-ring-color] motion-safe:duration-200">
        <div className="h-full w-full motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]">
          <DocPdfThumb docId={id} />
        </div>
      </div>
      <div className="mt-2.5">
        <h3 className="min-w-0 truncate font-heading text-[13px] font-medium tracking-tight">
          {displayTitle}
        </h3>
        <p className="mt-0.5 truncate font-mono text-[10.5px] text-muted-foreground/80">{id}</p>
      </div>
    </Link>
  );
}

const PROMPT_COLLAPSED_PX = 320;

const HEX_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g;

function renderBodyWithSwatches(body: string): ReactNode[] {
  const out: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = HEX_RE.exec(body);
  let key = 0;
  while (match !== null) {
    if (match.index > lastIndex) {
      out.push(<Fragment key={`t${key}`}>{body.slice(lastIndex, match.index)}</Fragment>);
    }
    const hex = match[0];
    out.push(
      <span
        key={`s${key}`}
        aria-hidden
        className="mr-[0.25em] -translate-y-[0.1em] inline-block size-[0.85em] rounded-[2px] align-middle ring-1 ring-foreground/15"
        style={{ background: hex }}
      />,
    );
    out.push(<Fragment key={`h${key}`}>{hex}</Fragment>);
    lastIndex = match.index + hex.length;
    key += 1;
    match = HEX_RE.exec(body);
  }
  if (lastIndex < body.length) {
    out.push(<Fragment key={`t${key}`}>{body.slice(lastIndex)}</Fragment>);
  }
  return out;
}

function NoDemoLargeState() {
  const t = useLocale();
  return (
    <div className="grid h-full w-full place-items-center bg-muted/40 px-8 text-center">
      <div className="max-w-sm">
        <p className="font-heading text-[15px] font-semibold tracking-tight">
          {t.themes.noDemoYet}
        </p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
          {t.themes.noDemoHintPrefix}
          <code className="rounded-[4px] bg-card px-1.5 py-0.5 font-mono text-[11.5px] text-foreground">
            /create-theme
          </code>
          {t.themes.noDemoHintSuffix}
        </p>
      </div>
    </div>
  );
}
