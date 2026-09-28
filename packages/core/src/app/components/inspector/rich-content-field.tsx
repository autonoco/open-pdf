import { Extension, type JSONContent } from '@tiptap/core';
import { Highlight } from '@tiptap/extension-highlight';
import { Color, TextStyle } from '@tiptap/extension-text-style';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Check, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ColorSelector, RichTextEditor } from '@/components/editor';
import '@/components/editor/style.css';
import {
  docToRuns,
  runsHaveStyle,
  runsText,
  runsToDoc,
  styleEquals,
} from '@/lib/inspector/rich-text';
import type { EditOp, RichTextRun } from '@/lib/inspector/use-editor';
import { cn } from '@/lib/utils';

// One text element is one paragraph: Enter inserts a line break, never a
// second block, so what the editor holds always maps back onto the JSX.
const SingleParagraph = Extension.create({
  name: 'singleParagraph',
  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.setHardBreak(),
      'Shift-Enter': () => this.editor.commands.setHardBreak(),
    };
  },
});

const extensions = [
  StarterKit.configure({
    blockquote: false,
    bulletList: false,
    code: false,
    codeBlock: false,
    dropcursor: false,
    gapcursor: false,
    heading: false,
    horizontalRule: false,
    link: false,
    listItem: false,
    listKeymap: false,
    orderedList: false,
    trailingNode: false,
  }),
  SingleParagraph,
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
];

const SAVE_DEBOUNCE_MS = 600;

type TextRead = { text: string; runs: RichTextRun[]; rich: boolean };

function sameRuns(a: RichTextRun[], b: RichTextRun[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((run, i) => run.text === b[i].text && styleEquals(run.style, b[i].style));
}

async function fetchText(
  docId: string,
  line: number,
  column: number,
  rendered: string,
  signal: AbortSignal,
): Promise<TextRead | null> {
  const params = new URLSearchParams({ docId, line: String(line), column: String(column) });
  if (rendered) params.set('text', rendered);
  const res = await fetch(`/__edit/text?${params}`, { signal });
  if (!res.ok) return null;
  return (await res.json()) as TextRead;
}

/**
 * The selected element's text, editable in place. Reads the element's
 * runs from source, and writes each change back through `/__edit` after a
 * short pause; the PDF re-renders from the saved file.
 */
export function RichContentField({
  docId,
  line,
  column,
  rendered,
}: {
  docId: string;
  line: number;
  column: number;
  /** Text under the selection in the PDF; tells reused components apart. */
  rendered: string;
}) {
  const [read, setRead] = useState<TextRead | null>(null);
  const [status, setStatus] = useState<'idle' | 'dirty' | 'saving' | 'saved'>('idle');
  const readRef = useRef<TextRead | null>(null);
  const lastRef = useRef<RichTextRun[]>([]);
  const timerRef = useRef<number | null>(null);
  const composingRef = useRef(false);
  const queueSaveRef = useRef<(runs: RichTextRun[]) => void>(() => {});

  const editor = useEditor({
    extensions,
    content: runsToDoc([]),
    immediatelyRender: true,
    editorProps: { attributes: { 'aria-label': 'Element text', spellcheck: 'true' } },
    onUpdate: ({ editor: ed }) => {
      if (composingRef.current) return;
      queueSaveRef.current(docToRuns(ed.getJSON() as JSONContent));
    },
  });

  const save = useCallback(
    async (runs: RichTextRun[]) => {
      const current = readRef.current;
      if (!current) return;
      const rich = current.rich && (runsHaveStyle(runs) || runsHaveStyle(current.runs));
      const op: EditOp = rich
        ? { kind: 'set-rich-text', runs, prevText: current.text }
        : { kind: 'set-text', value: runsText(runs), prevText: current.text };
      setStatus('saving');
      try {
        const res = await fetch('/__edit', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ docId, line, column, ops: [op] }),
        });
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(body.error ?? `POST /__edit → ${res.status}`);
        readRef.current = { text: runsText(runs), runs, rich: current.rich };
        setStatus('saved');
      } catch (e) {
        setStatus('dirty');
        toast.error(e instanceof Error ? e.message : String(e));
      }
    },
    [docId, line, column],
  );

  const queueSave = useCallback(
    (runs: RichTextRun[]) => {
      if (sameRuns(runs, lastRef.current)) return;
      lastRef.current = runs;
      setStatus('dirty');
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        void save(runs);
      }, SAVE_DEBOUNCE_MS);
    },
    [save],
  );

  queueSaveRef.current = queueSave;

  // The PDF snippet under the selection arrives a beat after the click;
  // reused components need it to pick their call site, so wait for it.
  useEffect(() => {
    if (rendered === '') return;
    const controller = new AbortController();
    setRead(null);
    setStatus('idle');
    fetchText(docId, line, column, rendered, controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return;
        readRef.current = next;
        setRead(next);
        if (next && editor) {
          lastRef.current = next.runs;
          editor.commands.setContent(runsToDoc(next.runs), { emitUpdate: false });
        }
      })
      .catch(() => {});
    return () => {
      controller.abort();
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
        void save(lastRef.current);
      }
    };
  }, [docId, line, column, rendered, editor, save]);

  useEffect(() => {
    const dom = editor?.view.dom;
    if (!dom) return;
    const start = () => {
      composingRef.current = true;
    };
    const end = () => {
      composingRef.current = false;
      if (editor) queueSave(docToRuns(editor.getJSON() as JSONContent));
    };
    dom.addEventListener('compositionstart', start);
    dom.addEventListener('compositionend', end);
    return () => {
      dom.removeEventListener('compositionstart', start);
      dom.removeEventListener('compositionend', end);
    };
  }, [editor, queueSave]);

  if (!read) return null;

  return (
    <div className="inspector-rich-text mt-2" data-inspector-ui>
      <RichTextEditor editor={editor} variant="compact">
        {read.rich && (
          <RichTextEditor.Toolbar>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Strikethrough />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <ColorSelector editor={editor} />
              <RichTextEditor.ClearFormatting />
            </RichTextEditor.ControlsGroup>
            <span
              className={cn(
                'ml-auto flex items-center gap-1 pr-1 text-[10px] text-muted-foreground',
                status === 'idle' && 'invisible',
              )}
              aria-live="polite"
            >
              {status === 'saving' ? (
                <Loader2 className="size-3 animate-spin" />
              ) : status === 'saved' ? (
                <Check className="size-3" />
              ) : null}
              {status === 'saving' ? 'Saving' : status === 'saved' ? 'Saved' : 'Unsaved'}
            </span>
          </RichTextEditor.Toolbar>
        )}
        <RichTextEditor.Content />
      </RichTextEditor>
    </div>
  );
}
