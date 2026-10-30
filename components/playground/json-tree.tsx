"use client";

import { useState, type ReactNode } from "react";

const PAGE = 25;

interface TreeProps {
  data: unknown;
  query: string;
  expandDepth: number;
  /** Changing this remounts the tree so expand/collapse-all takes effect. */
  version: number;
}

export function JsonTree({ data, query, expandDepth, version }: TreeProps) {
  return (
    <div className="json" key={version}>
      <Node value={data} depth={0} query={query.toLowerCase()} expandDepth={expandDepth} last />
    </div>
  );
}

function Node({
  name,
  value,
  depth,
  query,
  expandDepth,
  last,
}: {
  name?: string | number;
  value: unknown;
  depth: number;
  query: string;
  expandDepth: number;
  last: boolean;
}) {
  const [open, setOpen] = useState(depth < expandDepth);
  const [limit, setLimit] = useState(PAGE);
  const comma = last ? null : <span className="p">,</span>;
  const label =
    name === undefined ? null : typeof name === "number" ? (
      <span className="p">{name}: </span>
    ) : (
      <>
        <span className="k">&quot;{highlight(name, query)}&quot;</span>
        <span className="p">: </span>
      </>
    );

  if (value === null || typeof value !== "object") {
    return (
      <div className="pl-4 break-words">
        {label}
        <Primitive value={value} query={query} />
        {comma}
      </div>
    );
  }

  const isArray = Array.isArray(value);
  const entries: [string | number, unknown][] = isArray
    ? (value as unknown[]).map((v, i) => [i, v])
    : Object.entries(value as Record<string, unknown>);
  const [openB, closeB] = isArray ? ["[", "]"] : ["{", "}"];

  if (entries.length === 0) {
    return (
      <div className="pl-4">
        {label}
        <span className="p">
          {openB}
          {closeB}
        </span>
        {comma}
      </div>
    );
  }

  const summary = isArray ? `${entries.length} item${entries.length === 1 ? "" : "s"}` : previewObject(value);

  return (
    <div className={depth === 0 ? "" : "pl-4"}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="-ml-4 inline-flex w-4 justify-center text-[#9b93a8] hover:text-white"
        aria-label={open ? "Collapse" : "Expand"}
      >
        {open ? "▾" : "▸"}
      </button>
      {label}
      <span className="p">{openB}</span>
      {!open && (
        <>
          <button type="button" onClick={() => setOpen(true)} className="mx-1 rounded bg-white/10 px-1.5 text-[11px] text-[#cdc6d8] hover:bg-white/20">
            {summary}
          </button>
          <span className="p">{closeB}</span>
          {comma}
        </>
      )}
      {open && (
        <>
          {entries.slice(0, limit).map(([k, v], i, arr) => (
            <Node
              key={k}
              name={k}
              value={v}
              depth={depth + 1}
              query={query}
              expandDepth={expandDepth}
              last={i === arr.length - 1 && entries.length <= limit}
            />
          ))}
          {entries.length > limit && (
            <div className="pl-4">
              <button
                type="button"
                onClick={() => setLimit((l) => l + PAGE)}
                className="rounded bg-[var(--orange)] px-2 text-xs font-bold text-[#15121a]"
              >
                show {Math.min(PAGE, entries.length - limit)} more of {entries.length - limit} hidden
              </button>
            </div>
          )}
          <div>
            <span className="p">{closeB}</span>
            {comma}
          </div>
        </>
      )}
    </div>
  );
}

function Primitive({ value, query }: { value: unknown; query: string }) {
  if (typeof value === "string") {
    const isUrl = /^https?:\/\//.test(value);
    return (
      <span className="s">
        &quot;
        {isUrl ? (
          <a href={value} target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2">
            {highlight(value, query)}
          </a>
        ) : (
          highlight(value.length > 600 ? `${value.slice(0, 600)}…` : value, query)
        )}
        &quot;
      </span>
    );
  }
  if (typeof value === "number") return <span className="n">{value}</span>;
  return <span className="b">{String(value)}</span>;
}

function previewObject(value: object) {
  const v = value as Record<string, unknown>;
  const hint = v.name ?? v.clan;
  const keys = Object.keys(v).length;
  return typeof hint === "string" ? `${hint} · ${keys} keys` : `${keys} keys`;
}

function highlight(text: string, query: string): ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const parts: ReactNode[] = [];
  let from = 0;
  let idx = lower.indexOf(query);
  while (idx !== -1) {
    parts.push(text.slice(from, idx), <mark key={idx}>{text.slice(idx, idx + query.length)}</mark>);
    from = idx + query.length;
    idx = lower.indexOf(query, from);
  }
  parts.push(text.slice(from));
  return parts;
}

export function countMatches(raw: string, query: string) {
  if (!query) return 0;
  const lower = raw.toLowerCase();
  const q = query.toLowerCase();
  let n = 0;
  let i = lower.indexOf(q);
  while (i !== -1) {
    n++;
    i = lower.indexOf(q, i + q.length);
  }
  return n;
}
