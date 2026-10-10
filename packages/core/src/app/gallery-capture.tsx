import { useCallback, useEffect, useState } from 'react';
import { docIds, loadDoc } from './lib/docs';
import { PdfPageCanvas, usePdfDocument } from './lib/pdf/pdf-viewer';
import { useDocPdf } from './lib/pdf/use-doc-pdf';

function PdfCapture({ id }: { id: string }) {
  const { bytes, version, error: renderError } = useDocPdf(id);
  const { doc, error: pdfError } = usePdfDocument(bytes, version);
  const [width, setWidth] = useState<number | null>(null);
  const [metadataReady, setMetadataReady] = useState(false);
  const [title, setTitle] = useState(id);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    loadDoc(id)
      .then((value) => {
        if (active) {
          setTitle(value.meta?.title ?? id);
          setMetadataReady(true);
        }
      })
      .catch((cause) => {
        if (active) setError(String(cause));
      });
    return () => {
      active = false;
    };
  }, [id]);
  useEffect(() => {
    if (!doc) return;
    let active = true;
    doc
      .getPage(1)
      .then((page) => {
        const viewport = page.getViewport({ scale: 1 });
        if (active)
          setWidth(Math.min(innerWidth, (innerHeight * viewport.width) / viewport.height));
      })
      .catch((cause) => {
        if (active) setError(String(cause));
      });
    return () => {
      active = false;
    };
  }, [doc]);
  const onRendered = useCallback(() => setReady(true), []);
  const onRenderError = useCallback((cause: unknown) => setError(String(cause)), []);
  const failure = error ?? renderError ?? pdfError;
  return (
    <div
      className="flex h-svh w-full items-center justify-center"
      data-document-title={title}
      data-document-count={doc?.numPages}
      data-document-ready={ready && metadataReady && !failure ? '' : undefined}
      data-document-error={failure ?? undefined}
    >
      {doc && width && (
        <PdfPageCanvas
          doc={doc}
          pageNumber={1}
          width={width}
          onRendered={onRendered}
          onRenderError={onRenderError}
        />
      )}
    </div>
  );
}

export default function GalleryCapture() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id)
    return <div data-document-index={JSON.stringify({ version: 1, kind: 'pdfs', ids: docIds })} />;
  return <PdfCapture key={id} id={id} />;
}
