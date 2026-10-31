import type { CSSProperties, ReactNode } from 'react';
import { useClock, formatTime } from '../hooks/hooks';
import './ui.css';

interface SectionHeadProps {
  index: string;
  path: string;
  title: ReactNode;
  children?: ReactNode;
  id?: string;
}

export function SectionHead({ index, path, title, children, id }: SectionHeadProps) {
  return (
    <header className="sec-head reveal">
      <div className="sec-head__meta">
        <span className="sec-head__idx">{index}</span>
        <span>{path}</span>
      </div>
      <h2 id={id}>{title}</h2>
      {children && <p>{children}</p>}
    </header>
  );
}

interface WindowProps {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  style?: CSSProperties;
  as?: 'div' | 'section' | 'article';
  labelledBy?: string;
}

/** Shared window chrome used across the site: title bar + body. */
export function Window({ title, icon, actions, children, className = '', bodyClassName = '', style, as: Tag = 'div', labelledBy }: WindowProps) {
  return (
    <Tag className={`win ${className}`} style={style} aria-labelledby={labelledBy}>
      <div className="win__bar">
        <span className="win__lights" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        {icon && <span className="win__icon" aria-hidden="true">{icon}</span>}
        <span className="win__title">{title}</span>
        {actions && <span className="win__actions">{actions}</span>}
      </div>
      <div className={`win__body ${bodyClassName}`}>{children}</div>
    </Tag>
  );
}

export function DigitalClock({ size = 'm', showDate = false }: { size?: 's' | 'm' | 'l'; showDate?: boolean }) {
  const now = useClock();
  const [hh, mm, ss] = formatTime(now).split(':');
  return (
    <span className={`clock clock--${size}`}>
      <time dateTime={now.toISOString()} aria-label={`Local time ${hh}:${mm}`}>
        <span>{hh}</span>
        <span className="clock__sep">:</span>
        <span>{mm}</span>
        <span className="clock__sep">:</span>
        <span className="clock__sec">{ss}</span>
      </time>
      {showDate && (
        <span className="clock__date">
          {now.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      )}
    </span>
  );
}
