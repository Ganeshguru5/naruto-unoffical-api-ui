"use client";

import { useMemo, useState } from "react";
import { type Clan, type Shinobi, isClan, isShinobi, usableImage } from "@/lib/request";
import { ShinobiCard, ShinobiImage } from "@/components/shinobi/shinobi-card";
import { ShinobiDialog } from "@/components/shinobi/shinobi-dialog";

const ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth"];

export function ResultVisual({
  body,
  onTryClan,
  onFetchOne,
}: {
  body: unknown;
  onTryClan: (clan: string) => void;
  onFetchOne: (underscoredName: string) => void;
}) {
  const [selected, setSelected] = useState<Shinobi | null>(null);

  let content: React.ReactNode;

  if (Array.isArray(body) && body.length === 0) {
    content = <EmptyPanel />;
  } else if (Array.isArray(body) && body.every(isShinobi)) {
    content = <ShinobiGrid list={body} onOpen={setSelected} />;
  } else if (Array.isArray(body) && body.every(isClan)) {
    content = <ClanGrid clans={body} onOpen={setSelected} onTryClan={onTryClan} />;
  } else if (body && typeof body === "object" && !Array.isArray(body)) {
    const groups = Object.entries(body as Record<string, unknown>).filter(
      (e): e is [string, Shinobi[]] => Array.isArray(e[1]) && e[1].every(isShinobi),
    );
    content = groups.length ? (
      <div className="space-y-8">
        {groups.map(([title, list]) => (
          <section key={title}>
            <h3 className="display mb-4 text-3xl capitalize">
              {title} <span className="text-ink-soft">· {list.length}</span>
            </h3>
            <ol className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((s, i) => (
                <li key={`${s.id}-${i}`} className="relative">
                  <span className="caption absolute -top-3 left-2 z-10 rotate-[-3deg]">
                    {ORDINALS[i] ?? `${i + 1}th`}
                  </span>
                  <ShinobiCard shinobi={s} index={i} onOpen={setSelected} />
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    ) : (
      <NoVisual />
    );
  } else {
    content = <NoVisual />;
  }

  return (
    <>
      {content}
      <ShinobiDialog shinobi={selected} onClose={() => setSelected(null)} onFetchOne={onFetchOne} />
    </>
  );
}

function ShinobiGrid({ list, onOpen }: { list: Shinobi[]; onOpen: (s: Shinobi) => void }) {
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<"server" | "name" | "id">("server");

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const filtered = q
      ? list.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      : list;
    if (sort === "name") return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "id") return [...filtered].sort((a, b) => a.id - b.id);
    return filtered;
  }, [list, filter, sort]);

  return (
    <div>
      {list.length > 3 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter these results…"
            className="input-comic max-w-xs font-sans"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="input-comic w-auto font-sans"
            aria-label="Sort results"
          >
            <option value="server">Server order</option>
            <option value="name">Name A–Z</option>
            <option value="id">ID ascending</option>
          </select>
          <span className="text-sm font-semibold text-ink-soft">
            {shown.length} of {list.length}
          </span>
        </div>
      )}
      {shown.length === 0 ? (
        <p className="py-10 text-center font-semibold text-ink-soft">No shinobi match “{filter}”.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {shown.map((s, i) => (
            <ShinobiCard key={`${s.id}-${i}`} shinobi={s} index={i} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClanGrid({
  clans,
  onOpen,
  onTryClan,
}: {
  clans: Clan[];
  onOpen: (s: Shinobi) => void;
  onTryClan: (clan: string) => void;
}) {
  const [openClan, setOpenClan] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const shown = clans.filter((c) => c.clan.toLowerCase().includes(filter.trim().toLowerCase()));

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter clans…"
          className="input-comic max-w-xs font-sans"
        />
        <span className="text-sm font-semibold text-ink-soft">
          {shown.length} of {clans.length}
        </span>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {shown.map((c, i) => {
          const expanded = openClan === c.clan;
          const img = usableImage(c.img);
          return (
            <article key={c.clan} className="panel-sm anim-up overflow-hidden" style={{ animationDelay: `${Math.min(i, 10) * 35}ms` }}>
              <div className="flex gap-3 p-3">
                <div className="size-20 shrink-0 overflow-hidden rounded border-2 border-line bg-white">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" referrerPolicy="no-referrer" className="size-full object-contain p-1" />
                  ) : (
                    <div className="halftone-blue size-full" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="display text-2xl">{c.clan.replace(/_/g, " ")}</h3>
                    <span className="chip shrink-0">{c.members.length} members</span>
                  </div>
                  <p className={`text-xs text-ink-soft ${expanded ? "" : "line-clamp-3"}`}>{c.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 border-t-2 border-line bg-paper-2 px-3 py-2">
                <button type="button" className="btn btn-plain px-2.5 py-1 text-xs" onClick={() => setOpenClan(expanded ? null : c.clan)}>
                  {expanded ? "Hide members" : "Show members"}
                </button>
                <button type="button" className="btn btn-orange px-2.5 py-1 text-xs" onClick={() => onTryClan(c.clan)}>
                  Test /Clan_members/{c.clan}
                </button>
              </div>
              {expanded && (
                <div className="flex gap-3 overflow-x-auto border-t-2 border-line p-3 scrollbar-thin">
                  {c.members.length === 0 && <p className="text-sm text-ink-soft">No members listed.</p>}
                  {c.members.map((m) => (
                    <button key={m.id} type="button" onClick={() => onOpen(m)} className="w-20 shrink-0 text-center">
                      <ShinobiImage src={m.imagePro} name={m.name} className="mx-auto size-16 rounded-full border-2 border-line" />
                      <span className="mt-1 block text-[11px] font-semibold leading-tight">{m.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function EmptyPanel() {
  return (
    <div className="grid place-items-center py-10 text-center">
      <div className="bubble max-w-md">
        <p className="display text-3xl">Hmm… nobody here!</p>
        <p className="mt-1 text-sm text-ink-soft">
          The server answered 200 with an empty array. Names are exact and case-sensitive. Try{" "}
          <code className="font-mono">Naruto_Uzumaki</code> instead of <code className="font-mono">naruto</code>, or use
          Search Shinobis for partial matches.
        </p>
      </div>
    </div>
  );
}

function NoVisual() {
  return (
    <p className="py-10 text-center font-semibold text-ink-soft">
      This response has no visual form. Check the JSON tab.
    </p>
  );
}
