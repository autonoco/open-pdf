import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useEffect, useRef, useState } from 'react';
import { PdfPageCanvas, usePdfDocument } from './pdf-viewer';
import { useDocPdf } from './use-doc-pdf';

/**
 * Width-fit PDF page, top-cropped by the parent's fixed-aspect container,
 * Google-Docs-card style.
 */
export function FitWidthPdfPage({
  doc,
  pageNumber = 1,
}: {
  doc: PDFDocumentProxy | null;
  pageNumber?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-full w-full bg-white">
      {doc && width > 0 && <PdfPageCanvas doc={doc} pageNumber={pageNumber} width={width} />}
    </div>
  );
}

/** First-page PDF preview for doc browser cards. */
export function DocPdfThumb({ docId }: { docId: string }) {
  const { bytes, version } = useDocPdf(docId);
  const { doc } = usePdfDocument(bytes, version);
  return <FitWidthPdfPage doc={doc} />;
}
