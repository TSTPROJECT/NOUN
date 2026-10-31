import { useMemo, useState } from 'react';
import { Code2, FileCode2, Play } from 'lucide-react';
import { Window } from '../../components/ui';
import { useSound } from '../../audio/SoundContext';
import { FILES, tokenize } from './files';

export function CodeEditor({ onRun }: { onRun: (file: string) => void }) {
  const [active, setActive] = useState(0);
  const [cursorLine, setCursorLine] = useState(0);
  const { sfx } = useSound();
  const file = FILES[active];
  const lines = useMemo(() => file.code.split('\n').map(tokenize), [file]);

  const selectTab = (i: number) => {
    sfx('click');
    setActive(i);
    setCursorLine(0);
  };

  return (
    <Window
      title="~/noun/projects/stats-engine"
      icon={<Code2 size={14} />}
      className="editor"
      bodyClassName="editor__body"
      actions={
        <button type="button" className="btn btn--small editor__run" onClick={() => onRun(file.name)}>
          <Play size={13} aria-hidden="true" /> Run
        </button>
      }
    >
      <div className="editor__tabs" role="tablist" aria-label="Open files">
        {FILES.map((f, i) => (
          <button
            key={f.name}
            type="button"
            role="tab"
            id={`tab-${f.name}`}
            aria-selected={i === active}
            aria-controls="editor-panel"
            tabIndex={i === active ? 0 : -1}
            className={`editor__tab mono ${i === active ? 'is-active' : ''}`}
            onClick={() => selectTab(i)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const next = (active + (e.key === 'ArrowRight' ? 1 : FILES.length - 1)) % FILES.length;
                selectTab(next);
                document.getElementById(`tab-${FILES[next].name}`)?.focus();
              }
            }}
          >
            <FileCode2 size={13} aria-hidden="true" />
            {f.name}
          </button>
        ))}
      </div>

      <div className="editor__code mono" id="editor-panel" role="tabpanel" aria-labelledby={`tab-${file.name}`} tabIndex={0}>
        <pre>
          <code>
            {lines.map((tokens, li) => (
              <span
                key={`${file.name}-${li}`}
                className={`editor__line ${li === cursorLine ? 'is-current' : ''}`}
                onClick={() => setCursorLine(li)}
              >
                <span className="editor__ln" aria-hidden="true">
                  {li + 1}
                </span>
                <span className="editor__src">
                  {tokens.map((tk, ti) => (
                    <span key={ti} className={`tk-${tk.t}`}>
                      {tk.v}
                    </span>
                  ))}
                  {li === cursorLine && <span className="editor__caret" aria-hidden="true" />}
                  {'\n'}
                </span>
              </span>
            ))}
          </code>
        </pre>
      </div>

      <div className="editor__status mono" aria-hidden="true">
        <span>main*</span>
        <span>
          Ln {cursorLine + 1}, Col 1
        </span>
        <span>{file.lang}</span>
        <span>UTF-8</span>
        <span className="editor__lint">0 errors · 1 TODO</span>
      </div>
    </Window>
  );
}
