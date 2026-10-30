"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/endpoints";
import { type Shinobi, isShinobi, runRequest } from "@/lib/request";
import { ShinobiImage } from "@/components/shinobi/shinobi-card";
import { ShinobiDialog } from "@/components/shinobi/shinobi-dialog";

type Mode = "summon" | "search";

export function LiveSummon() {
  const [mode, setMode] = useState<Mode>("summon");
  const [term, setTerm] = useState("");
  const [list, setList] = useState<Shinobi[] | null>(null);
  const [meta, setMeta] = useState<{ url: string; ms: number; status: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Shinobi | null>(null);
  const [round, setRound] = useState(0);
  const abort = useRef<AbortController | null>(null);

  const call = async (url: string) => {
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setLoading(true);
    const res = await runRequest(url, ctrl.signal);
    if (ctrl.signal.aborted) return;
    setLoading(false);
    setMeta({ url, ms: res.timeMs, status: res.status });
    setList(Array.isArray(res.body) ? res.body.filter(isShinobi) : []);
    setRound((r) => r + 1);
  };

  // Debounced live search.
  useEffect(() => {
    if (mode !== "search" || term.trim().length < 2) return;
    const t = setTimeout(() => void call(`${API_BASE}/shinobis_search/${encodeURIComponent(term.trim())}`), 350);
    return () => clearTimeout(t);
  }, [term, mode]);

  const shown = (list ?? []).slice(0, mode === "summon" ? 6 : 9);

  return (
    <div className="panel flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b-[3px] border-line bg-ink px-3 py-2 text-paper">
        <span className="size-3 rounded-full bg-red" />
        <span className="size-3 rounded-full bg-yellow" />
        <span className="size-3 rounded-full bg-[var(--green)]" />
        <span className="ml-2 truncate font-mono text-xs opacity-80">
          {meta ? meta.url.replace(API_BASE, "") : "/randomShinobis"}
        </span>
        {meta && (
          <span className="ml-auto shrink-0 font-mono text-xs">
            <span className={meta.status === 200 ? "text-[#7ee2a8]" : "text-[#ff8b98]"}>{meta.status || "ERR"}</span> · {meta.ms}ms
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b-[3px] border-line bg-paper-2 p-3">
        <div className="flex rounded border-[2.5px] border-line bg-card p-0.5">
          {(["summon", "search"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`display rounded-sm px-3 py-0.5 text-lg tracking-wider ${mode === m ? "bg-orange text-[#15121a]" : ""}`}
            >
              {m === "summon" ? "Random" : "Search"}
            </button>
          ))}
        </div>
        {mode === "summon" ? (
          <button type="button" onClick={() => void call(`${API_BASE}/randomShinobis`)} className="btn btn-orange display ml-auto text-xl tracking-wider" disabled={loading}>
            Kuchiyose no Jutsu!
          </button>
        ) : (
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Type a name… (uchiha, kakashi)"
            className="input-comic min-w-0 flex-1 font-sans"
          />
        )}
      </div>

      <div className="speedlines relative min-h-80 flex-1 p-4">
        {loading && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-paper/60 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-3">
              <div className="rasengan" />
              <span className="sfx text-4xl">POOF!</span>
            </div>
          </div>
        )}

        {!list && !loading && (
          <div className="grid h-full min-h-72 place-items-center text-center">
            <div className="bubble max-w-xs">
              <p className="display text-2xl">Press the button to summon a random squad!</p>
              <p className="mt-1 text-xs text-ink-soft">That is a real call to the live API.</p>
            </div>
          </div>
        )}

        {list && list.length === 0 && !loading && (
          <p className="grid min-h-72 place-items-center font-semibold text-ink-soft">No shinobi found. Try another name.</p>
        )}

        {list && list.length > 0 && (
          <div key={round} className="grid grid-cols-3 gap-3">
            {shown.map((s, i) => (
              <button
                key={`${s.id}-${i}`}
                type="button"
                onClick={() => setSelected(s)}
                style={{ ["--r" as string]: `${(i % 2 ? 1 : -1) * (1 + (i % 3))}deg`, animationDelay: `${i * 60}ms` }}
                className="anim-pop panel-sm overflow-hidden text-left transition-transform hover:z-10 hover:scale-105"
              >
                <ShinobiImage src={s.imagePro} name={s.name} className="aspect-square w-full border-b-2 border-line" />
                <p className="truncate px-1.5 py-1 text-xs font-bold">{s.name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {list && list.length > shown.length && (
        <div className="border-t-[3px] border-line bg-paper-2 px-3 py-2 text-right text-xs font-semibold">
          +{list.length - shown.length} more ·{" "}
          <Link
            className="underline decoration-2 underline-offset-2 hover:text-orange"
            href={mode === "summon" ? "/playground?ep=random-shinobis" : `/playground?ep=search-shinobis&query=${encodeURIComponent(term.trim())}`}
          >
            open in playground
          </Link>
        </div>
      )}

      <ShinobiDialog shinobi={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
