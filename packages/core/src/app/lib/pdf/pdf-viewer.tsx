import type { PDFDocumentProxy } from 'pdfjs-dist';
import * as pdfjs from 'pdfjs-dist';
import { memo, useEffect, useRef, useState } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

/**
 * Parse PDF bytes into a pdf.js document. Passes a copy — pdf.js neuters the
 * input buffer, and the caller keeps `bytes` for download/export.
 */
export function usePdfDocument(bytes: Uint8Array | null, _version: number) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bytes) {
      // Null bytes means a different document is loading; drop the stale one.
      setDoc((prev) => {
        prev?.destroy();
        return null;
      });
      setError(null);
      return;
    }
    let cancelled = false;
    let loaded: PDFDocumentProxy | null = null;
    const task = pdfjs.getDocument({ data: bytes.slice() });
    task.promise
      .then((d) => {
        if (cancelled) {
          d.destroy();
          return;
        }
        loaded = d;
        setDoc((prev) => {
          prev?.destroy();
          return d;
        });
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e?.message ?? e));
      });
    return () => {
      cancelled = true;
      // Newer effect run owns `doc` now; only destroy if we never published.
      if (loaded === null) task.destroy();
    };
    // `version` keys re-parses; bytes identity alone is not reliable after transfers.
  }, [bytes]);

  return { doc, error };
}

type PdfPageCanvasProps = {
  doc: PDFDocumentProxy;
  pageNumber: number;
  /** CSS pixel width to fit the page into. */
  width: number;
  className?: string;
};

export const PdfPageCanvas = memo(function PdfPageCanvas({
  doc,
  pageNumber,
  width,
  className,
}: PdfPageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let renderTask: ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']> | null =
      null;
    doc
      .getPage(pageNumber)
      .then((page) => {
        if (cancelled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const base = page.getViewport({ scale: 1 });
        const scale = width / base.width;
        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: scale * dpr });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${(width * base.height) / base.width}px`;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        renderTask = page.render({ canvasContext: ctx, canvas, viewport });
        renderTask.promise.catch(() => {
          // Cancelled renders throw; benign.
        });
      })
      .catch(() => {
        // Page fetch after doc.destroy(); benign during doc swaps.
      });
    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [doc, pageNumber, width]);

  return <canvas ref={canvasRef} className={className} />;
});
