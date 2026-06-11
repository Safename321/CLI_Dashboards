// Renders one Help & Guide page from its data definition (see help-content.js
// for the { title, sub, sections: [{ heading, body, features, table }] } shape).
import { forwardRef } from 'react';

export function Hdr({ title, sub }) {
  return (
    <div className="mb-6 border-b border-border pb-4">
      <div className="mb-1 font-serif text-2xl font-bold text-white">{title}</div>
      {sub && <div className="text-[13px] text-muted">{sub}</div>}
    </div>
  );
}

function Body({ paragraphs }) {
  const items = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
  return (
    <div className="text-[13px] leading-7 text-muted">
      {items.map((p, i) => <p key={i} className={i < items.length - 1 ? 'mb-3' : ''}>{p}</p>)}
    </div>
  );
}

function FeatList({ items }) {
  return (
    <ul className="flex list-none flex-col gap-2">
      {items.map(([name, desc], i) => (
        <li key={i} className="rounded-md border-l-[3px] border-accent bg-panel px-3 py-2 text-[13px] leading-6 text-muted">
          <span className="font-semibold text-white">{name}</span>{' — '}{desc}
        </li>
      ))}
    </ul>
  );
}

function Tbl({ heads, rows }) {
  return (
    <table className="mt-2 w-full border-collapse text-xs">
      <thead>
        <tr>
          {heads.map((h, i) => (
            <th key={i} className="border-b border-border bg-panel px-2.5 py-2 text-left text-[11px] font-semibold text-sky-300">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} className={ri % 2 === 1 ? 'bg-panel/40' : ''}>
            {row.map((cell, ci) => (
              <td key={ci} className="border-b border-border px-2.5 py-1.5 align-top leading-6 text-muted">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const HelpPage = forwardRef(function HelpPage({ page }, ref) {
  return (
    <div ref={ref}>
      <Hdr title={page.title} sub={page.sub} />
      {page.sections.map((sec, idx) => (
        <div key={idx} data-sec-idx={idx} className="mb-7 scroll-mt-5">
          <div className="mb-2.5 border-b border-border pb-1.5 text-[11px] font-bold uppercase tracking-wider text-accent">
            {sec.heading}
          </div>
          {sec.body && <Body paragraphs={sec.body} />}
          {sec.features && <FeatList items={sec.features} />}
          {sec.table && <Tbl heads={sec.table.heads} rows={sec.table.rows} />}
        </div>
      ))}
    </div>
  );
});

export default HelpPage;
