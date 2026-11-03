import { afterEach, expect, it, vi } from 'vitest';
import { reportDocumentError } from './report-error';
import { exportDoc, renderCleanPdf } from './use-doc-pdf';

vi.mock('virtual:open-pdf/docs', () => ({ docImportUrl: () => '/draft.js' }));
vi.mock('virtual:open-pdf/templates', () => ({ templateImportUrl: () => '/template.js' }));
vi.mock('virtual:open-pdf/themes', () => ({ demoImportUrl: () => '/theme.js' }));
vi.mock('../docs', () => ({ docChangeIncludes: () => false }));
vi.mock('./report-error', () => ({ reportDocumentError: vi.fn(() => new Promise(() => {})) }));

class FailingWorker extends EventTarget {
  constructor() {
    super();
    queueMicrotask(() =>
      this.dispatchEvent(new MessageEvent('message', { data: { type: 'boot' } })),
    );
  }
  postMessage(request: { seq: number; type: string }) {
    this.dispatchEvent(
      new MessageEvent('message', {
        data: {
          seq: request.seq,
          type: request.type === 'export' ? 'export-error' : 'render-error',
          message: 'original renderer error',
        },
      }),
    );
  }
}
afterEach(() => vi.unstubAllGlobals());
it('returns both export errors even while telemetry remains pending', async () => {
  vi.stubGlobal('Worker', FailingWorker);
  await expect(renderCleanPdf('draft')).rejects.toThrow('original renderer error');
  await expect(exportDoc('draft', 'docx')).rejects.toThrow('original renderer error');
  expect(reportDocumentError).toHaveBeenCalledTimes(2);
});
