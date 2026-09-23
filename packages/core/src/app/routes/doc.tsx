import config from 'virtual:open-pdf/config';
import {
  ChevronDown,
  ChevronLeft,
  Crosshair,
  Download,
  FileCode2,
  FileText,
  FileType2,
  Loader2,
  MessageSquarePlus,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { type EditableFormat, FORMAT_MIME } from '../../export/editable';
import { buildHitMap, extractBoxText, type LocBox, type PageHitMap } from '../lib/pdf/hit-map';
import { InspectOverlay } from '../lib/pdf/inspect-overlay';
import { PdfPageCanvas, usePdfDocument } from '../lib/pdf/pdf-viewer';
import { exportDoc, renderCleanPdf, useDocPdf } from '../lib/pdf/use-doc-pdf';
import { useDocModule } from '../lib/use-doc-module';

const { showDocUi, showDocBrowser } = config.build;

const PAGE_MAX_WIDTH = 880;
const THUMB_WIDTH = 108;

type Selection = { box: LocBox; pageIndex: number; text: string };

export function Doc() {
  const { docId = '' } = useParams();
  const { doc: docModule } = useDocModule(docId);
  const { bytes, tags, rendering, error, durationMs, version } = useDocPdf(docId);
  const { doc: pdfDoc, error: parseError } = usePdfDocument(bytes, version);

  const title = docModule?.meta?.title ?? docId;
  useEffect(() => {
    document.title = `${title} — open-pdf`;
  }, [title]);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pageWidth, setPageWidth] = useState(PAGE_MAX_WIDTH);
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      setPageWidth(Math.min(PAGE_MAX_WIDTH, Math.max(320, el.clientWidth - 96)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const numPages = pdfDoc?.numPages ?? 0;
  const pageNumbers = useMemo(() => Array.from({ length: numPages }, (_, i) => i + 1), [numPages]);

  // ── Inspector ────────────────────────────────────────────────────────────
  const [inspecting, setInspecting] = useState(false);
  const [hitMap, setHitMap] = useState<PageHitMap[] | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    setSelection(null);
    setHitMap(null);
    if (!pdfDoc || Object.keys(tags).length === 0) return;
    let cancelled = false;
    buildHitMap(pdfDoc, tags)
      .then((maps) => {
        if (!cancelled) setHitMap(maps);
      })
      .catch(() => {
        if (!cancelled) setHitMap(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, tags]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'i') setInspecting((v) => !v);
      if (e.key === 'Escape') setSelection(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Agent cursor: which doc is open, and what is selected.
  useEffect(() => {
    if (!import.meta.hot || !docId || numPages === 0) return;
    import.meta.hot.send('open-pdf:current', {
      docId,
      pageIndex: 0,
      totalPages: numPages,
      docTitle: title,
      view: 'docs',
    });
  }, [docId, numPages, title]);

  useEffect(() => {
    if (!import.meta.hot) return;
    const [line, column] = selection
      ? selection.box.loc.split(':').map(Number)
      : [undefined, undefined];
    import.meta.hot.send('open-pdf:current', {
      selection: selection
        ? { line, column, tagName: selection.box.tag, text: selection.text }
        : null,
    });
  }, [selection]);

  const selectBox = useCallback(
    (box: LocBox, pageIndex: number) => {
      setSelection({ box, pageIndex, text: '' });
      setNote('');
      if (pdfDoc) {
        extractBoxText(pdfDoc, pageIndex, box.pdfRect)
          .then((text) => {
            setSelection((sel) =>
              sel && sel.box.loc === box.loc && sel.pageIndex === pageIndex
                ? { ...sel, text }
                : sel,
            );
          })
          .catch(() => {});
      }
    },
    [pdfDoc],
  );

  const submitComment = useCallback(async () => {
    if (!selection || !note.trim()) return;
    const [line, column] = selection.box.loc.split(':').map(Number);
    setSavingNote(true);
    try {
      const res = await fetch('/__comments/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId, line, column, text: note.trim() }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `POST /__comments/add → ${res.status}`);
      }
      toast.success('Comment saved — run /apply-comments to apply it');
      setSelection(null);
      setNote('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingNote(false);
    }
  }, [selection, note, docId]);

  const [exporting, setExporting] = useState(false);

  const saveFile = (out: Uint8Array, format: 'pdf' | EditableFormat) => {
    const blob = new Blob([out.slice().buffer as ArrayBuffer], { type: FORMAT_MIME[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docId}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const download = async (format: 'pdf' | EditableFormat) => {
    if (!bytes || exporting) return;
    setExporting(true);
    try {
      if (format === 'pdf') {
        // Preview bytes carry inspector annotations; export re-renders clean.
        saveFile(await renderCleanPdf(docId).catch(() => bytes.slice()), 'pdf');
      } else {
        saveFile(await exportDoc(docId, format), format);
      }
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setExporting(false);
    }
  };

  const scrollToPage = (n: number) => {
    pageRefs.current[n - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex h-screen flex-col bg-muted/40 text-foreground">
      {showDocUi && (
        <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-3">
          {showDocBrowser && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Back to documents"
              render={<Link to="/" />}
            >
              <ChevronLeft className="size-4" />
            </Button>
          )}
          <h1 className="min-w-0 truncate text-sm font-medium">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            {rendering && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Rendering
              </span>
            )}
            {!rendering && durationMs !== null && (
              <span className="text-xs tabular-nums text-muted-foreground">
                {numPages} {numPages === 1 ? 'page' : 'pages'} · {Math.round(durationMs)}ms
              </span>
            )}
            <Button
              variant={inspecting ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInspecting((v) => !v)}
              disabled={!hitMap}
              aria-pressed={inspecting}
              title="Inspect elements (i) — click any element to select it or leave a comment"
            >
              <Crosshair className="size-4" />
              Inspect
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={!bytes || exporting}
                aria-label="Export"
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                {exporting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Export
                <ChevronDown className="size-3.5 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                <DropdownMenuItem onClick={() => download('pdf')}>
                  <FileText />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => download('docx')}>
                  <FileType2 />
                  Word (.docx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => download('md')}>
                  <FileCode2 />
                  Markdown (.md)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      )}

      {(error || parseError) && (
        <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 font-mono text-xs text-destructive">
          {error ?? parseError}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        {showDocUi && pdfDoc && numPages > 1 && (
          <aside className="w-[148px] shrink-0 overflow-y-auto border-r bg-background/60 p-4">
            <div className="flex flex-col gap-3">
              {pageNumbers.map((n) => (
                <button
                  key={`${version}-${n}`}
                  type="button"
                  onClick={() => scrollToPage(n)}
                  className="group flex flex-col items-center gap-1"
                >
                  <span className="overflow-hidden rounded-sm border shadow-sm transition-shadow group-hover:shadow-md">
                    <PdfPageCanvas doc={pdfDoc} pageNumber={n} width={THUMB_WIDTH} />
                  </span>
                  <span className="text-[10px] tabular-nums text-muted-foreground">{n}</span>
                </button>
              ))}
            </div>
          </aside>
        )}

        <main
          ref={viewportRef}
          className={cn(
            'relative min-w-0 flex-1 overflow-y-auto',
            rendering && 'opacity-90 transition-opacity',
          )}
        >
          {!pdfDoc && !error && !parseError && (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Rendering document…
              </span>
            </div>
          )}
          {pdfDoc && (
            <div className="mx-auto flex flex-col items-center gap-6 px-8 py-8">
              {pageNumbers.map((n) => (
                <div
                  key={`${version}-${n}`}
                  ref={(el) => {
                    pageRefs.current[n - 1] = el;
                  }}
                  className="relative overflow-hidden rounded-sm bg-white shadow-md ring-1 ring-black/10"
                >
                  <PdfPageCanvas doc={pdfDoc} pageNumber={n} width={pageWidth} />
                  {inspecting && hitMap?.[n - 1] && (
                    <InspectOverlay
                      map={hitMap[n - 1]}
                      cssWidth={pageWidth}
                      selectedLoc={
                        selection && selection.pageIndex === n - 1 ? selection.box.loc : null
                      }
                      onSelect={(box) => selectBox(box, n - 1)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {selection && (
            <div className="fixed bottom-6 right-6 z-20 w-[340px] rounded-lg border bg-background p-3 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                  {selection.box.tag}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  line {selection.box.loc.replace(':', ', col ')}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto size-6"
                  aria-label="Clear selection"
                  onClick={() => setSelection(null)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
              {selection.text && (
                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                  “{selection.text}”
                </p>
              )}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Leave a note for your agent — e.g. “make this bold”"
                rows={2}
                className="mt-2 w-full resize-none rounded-md border bg-transparent px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  size="sm"
                  onClick={submitComment}
                  disabled={!note.trim() || savingNote}
                  aria-label="Save comment"
                >
                  {savingNote ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <MessageSquarePlus className="size-3.5" />
                  )}
                  Comment
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
