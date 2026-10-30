"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  API_BASE,
  CATEGORIES,
  ENDPOINTS,
  SCHEMAS,
  type Endpoint,
  buildPath,
  defaultParams,
  getEndpoint,
} from "@/lib/endpoints";
import { type ApiResult, formatBytes, runRequest } from "@/lib/request";
import { addHistory, clearHistory, useHistory } from "@/lib/history";
import { JsonTree, countMatches } from "./json-tree";
import { ResultVisual } from "./result-visual";
import { CodeSnippets } from "./code-snippets";
import { CopyButton } from "./copy-button";

type Tab = "visual" | "json" | "raw" | "headers" | "code";

const TABS: { id: Tab; label: string }[] = [
  { id: "visual", label: "Visual" },
  { id: "json", label: "JSON" },
  { id: "raw", label: "Raw" },
  { id: "headers", label: "Headers" },
  { id: "code", label: "Code" },
];

function paramsFromSearch(endpoint: Endpoint, search: URLSearchParams) {
  const values = defaultParams(endpoint);
  for (const p of endpoint.params) {
    const v = search.get(p.name);
    if (v) values[p.name] = v;
  }
  return values;
}

export function Playground() {
  const router = useRouter();
  const search = useSearchParams();
  const initial = getEndpoint(search.get("ep")) ?? ENDPOINTS[0];

  const [endpoint, setEndpoint] = useState<Endpoint>(initial);
  const [values, setValues] = useState<Record<string, string>>(() => paramsFromSearch(initial, search));
  const [customUrl, setCustomUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("visual");
  const [query, setQuery] = useState("");
  const [expandDepth, setExpandDepth] = useState(2);
  const [treeVersion, setTreeVersion] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const history = useHistory();

  const builtUrl = `${API_BASE}${buildPath(endpoint, values)}`;
  const url = customUrl ?? builtUrl;
  const missing = customUrl === null && endpoint.params.some((p) => !values[p.name]?.trim());

  const syncUrl = useCallback(
    (ep: Endpoint, vals: Record<string, string>) => {
      const qs = new URLSearchParams({ ep: ep.id });
      for (const p of ep.params) if (vals[p.name]) qs.set(p.name, vals[p.name]);
      router.replace(`/playground?${qs}`, { scroll: false });
    },
    [router],
  );

  const send = useCallback(
    async (ep: Endpoint, target: string, vals: Record<string, string>) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      const res = await runRequest(target, controller.signal);
      // Superseded by a newer request or cancelled by the user.
      if (controller.signal.aborted) return;
      setResult(res);
      setLoading(false);
      setQuery("");
      if (!res.isJson || res.status >= 400) setTab((t) => (t === "visual" ? "raw" : t));
      else setTab((t) => (t === "raw" ? "visual" : t));
      addHistory({
        endpointId: ep.id,
        label: ep.name,
        url: target,
        params: vals,
        status: res.status,
        timeMs: res.timeMs,
        at: res.at,
      });
    },
    [],
  );

  // Fire the request named in the URL on first load so shared links show results right away.
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current || !search.get("ep")) return;
    booted.current = true;
    const vals = paramsFromSearch(initial, search);
    void send(initial, `${API_BASE}${buildPath(initial, vals)}`, vals);
  }, [initial, search, send]);

  const selectEndpoint = (ep: Endpoint, vals = defaultParams(ep)) => {
    setEndpoint(ep);
    setValues(vals);
    setCustomUrl(null);
    setNavOpen(false);
    syncUrl(ep, vals);
    void send(ep, `${API_BASE}${buildPath(ep, vals)}`, vals);
  };

  const fire = () => {
    if (missing || loading) return;
    syncUrl(endpoint, values);
    void send(endpoint, url, values);
  };

  const cancel = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey || e.target instanceof HTMLInputElement)) {
      e.preventDefault();
      fire();
    }
  };

  const download = () => {
    if (!result) return;
    const blob = new Blob([result.isJson ? JSON.stringify(result.body, null, 2) : result.rawText], {
      type: result.isJson ? "application/json" : "text/plain",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${endpoint.id}-${result.at}.${result.isJson ? "json" : "txt"}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const count = result && Array.isArray(result.body) ? result.body.length : null;
  const pretty = result ? (result.isJson ? JSON.stringify(result.body, null, 2) : result.rawText) : "";

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* ---------- Sidebar ---------- */}
      <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1 scrollbar-thin">
        <button
          type="button"
          onClick={() => setNavOpen((o) => !o)}
          className="btn btn-plain mb-3 w-full justify-between lg:hidden"
          aria-expanded={navOpen}
        >
          <span className="flex items-center gap-2">
            <span className="method-get">GET</span> {endpoint.name}
          </span>
          <span>{navOpen ? "▴" : "▾"}</span>
        </button>

        <div className={`${navOpen ? "block" : "hidden"} space-y-5 lg:block`}>
          {CATEGORIES.map((cat) => (
            <div key={cat}>
              <p className="caption mb-2 rotate-[-1.5deg]">{cat}</p>
              <ul className="space-y-1.5">
                {ENDPOINTS.filter((e) => e.category === cat).map((ep) => {
                  const active = ep.id === endpoint.id;
                  return (
                    <li key={ep.id}>
                      <button
                        type="button"
                        onClick={() => selectEndpoint(ep)}
                        className={`flex w-full items-center gap-2 rounded border-2 px-2.5 py-1.5 text-left text-sm font-semibold transition-all ${
                          active
                            ? "translate-x-1 border-line bg-orange text-[#15121a] shadow-[3px_3px_0_var(--line)]"
                            : "border-transparent hover:border-line hover:bg-card"
                        }`}
                      >
                        <span className="method-get">GET</span>
                        <span className="flex-1 truncate">{ep.name}</span>
                        <StatusDot status={ep.status} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <HistoryList
            entries={history}
            onPick={(h) => {
              const ep = getEndpoint(h.endpointId);
              if (ep) selectEndpoint(ep, { ...defaultParams(ep), ...h.params });
            }}
          />
        </div>
      </aside>

      {/* ---------- Main ---------- */}
      <section className="min-w-0 space-y-6" onKeyDown={onKey}>
        {/* Request panel */}
        <div className="panel overflow-hidden">
          <div className="halftone flex flex-wrap items-center gap-3 border-b-[3px] border-line bg-paper-2 px-4 py-3">
            <h1 className="display text-4xl">{endpoint.name}</h1>
            <StatusBadge endpoint={endpoint} />
            <span className="sfx ml-auto hidden rotate-[-4deg] text-3xl sm:block">{endpoint.sfx}</span>
          </div>

          <div className="space-y-4 p-4">
            <p className="text-sm text-ink-soft">{endpoint.description}</p>
            {endpoint.statusNote && (
              <p className="rounded border-2 border-dashed border-red px-3 py-2 text-sm font-semibold text-red">
                ⚠ {endpoint.statusNote}
              </p>
            )}

            {endpoint.params.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {endpoint.params.map((p) => (
                  <div key={p.name}>
                    <label htmlFor={`param-${p.name}`} className="mb-1 flex items-baseline gap-2 text-sm font-bold">
                      <code className="font-mono text-orange">{`{${p.name}}`}</code>
                      <span className="text-xs font-medium text-ink-soft">{p.description}</span>
                    </label>
                    <input
                      id={`param-${p.name}`}
                      value={values[p.name] ?? ""}
                      onChange={(e) => {
                        setCustomUrl(null);
                        setValues((v) => ({ ...v, [p.name]: e.target.value }));
                      }}
                      placeholder={p.example}
                      className="input-comic"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            const vals = { ...values, [p.name]: s };
                            setValues(vals);
                            setCustomUrl(null);
                            syncUrl(endpoint, vals);
                            void send(endpoint, `${API_BASE}${buildPath(endpoint, vals)}`, vals);
                          }}
                          className={`chip hover:bg-orange-soft ${values[p.name] === s ? "!bg-yellow text-[#15121a]" : ""}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label htmlFor="req-url" className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                Request URL {customUrl !== null && <span className="text-orange">· edited by hand</span>}
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded border-[2.5px] border-line bg-card pl-2">
                  <span className="method-get">GET</span>
                  <input
                    id="req-url"
                    value={url}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent py-2 pr-2 font-mono text-sm outline-none"
                    spellCheck={false}
                  />
                  {customUrl !== null && (
                    <button type="button" onClick={() => setCustomUrl(null)} className="pr-2 text-xs font-bold text-orange" title="Reset to endpoint URL">
                      reset
                    </button>
                  )}
                </div>
                {loading ? (
                  <button type="button" onClick={cancel} className="btn btn-ink">
                    Cancel
                  </button>
                ) : (
                  <button type="button" onClick={fire} disabled={missing} className="btn btn-orange display text-xl tracking-wider">
                    Send it! <kbd className="hidden rounded border border-[#15121a]/40 px-1 font-mono text-[10px] sm:inline">Ctrl ⏎</kbd>
                  </button>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <CopyButton text={url} label="Copy URL" />
                <a href={url} target="_blank" rel="noreferrer" className="rounded border-2 border-line bg-card px-2 py-0.5 text-xs font-bold shadow-[2px_2px_0_var(--line)]">
                  Open in new tab ↗
                </a>
              </div>
            </div>

            <details className="group rounded border-2 border-line bg-paper-2">
              <summary className="cursor-pointer select-none px-3 py-2 text-sm font-bold">Response schema</summary>
              <pre className="overflow-x-auto border-t-2 border-line bg-code p-3 font-mono text-xs text-code-fg">{SCHEMAS[endpoint.kind]}</pre>
            </details>
          </div>
        </div>

        {/* Response panel */}
        <div aria-live="polite">
          {loading && <LoadingPanel sfx={endpoint.sfx} />}
          {!loading && !result && <IdlePanel onSend={fire} disabled={missing} />}
          {!loading && result && (
            <div className="anim-up">
              <ResultHeader result={result} count={count} />

              <div className="mt-5 flex flex-wrap items-end gap-1 px-1" role="tablist">
                {TABS.map((t) => (
                  <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className="tab">
                    {t.label}
                  </button>
                ))}
                <div className="mb-1.5 ml-auto flex gap-2">
                  <CopyButton text={pretty} label="Copy body" />
                  <button type="button" onClick={download} className="rounded border-2 border-line bg-card px-2 py-0.5 text-xs font-bold shadow-[2px_2px_0_var(--line)]">
                    Download
                  </button>
                </div>
              </div>

              <div className="panel min-h-64 p-4">
                {tab === "visual" &&
                  (result.isJson && result.ok ? (
                    <ResultVisual
                      body={result.body}
                      onTryClan={(clan) => {
                        const ep = getEndpoint("clan-members")!;
                        selectEndpoint(ep, { clan });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      onFetchOne={(name) => {
                        selectEndpoint(getEndpoint("one-shinobi")!, { name });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  ) : (
                    <ErrorExplainer result={result} />
                  ))}

                {tab === "json" &&
                  (result.isJson ? (
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search keys & values…" className="input-comic max-w-xs" />
                        {query && <span className="text-sm font-semibold text-ink-soft">{countMatches(pretty, query)} matches</span>}
                        <div className="ml-auto flex gap-2">
                          <button type="button" className="chip" onClick={() => { setExpandDepth(99); setTreeVersion((v) => v + 1); }}>
                            Expand all
                          </button>
                          <button type="button" className="chip" onClick={() => { setExpandDepth(1); setTreeVersion((v) => v + 1); }}>
                            Collapse all
                          </button>
                        </div>
                      </div>
                      <div className="max-h-[70vh] overflow-auto rounded border-[2.5px] border-line bg-code p-4 scrollbar-thin">
                        <JsonTree data={result.body} query={query} expandDepth={expandDepth} version={treeVersion} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-ink-soft">The response is not JSON. See the Raw tab.</p>
                  ))}

                {tab === "raw" && (
                  <pre className="max-h-[70vh] overflow-auto rounded border-[2.5px] border-line bg-code p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words text-code-fg scrollbar-thin">
                    {result.networkError ?? (pretty || "(empty body)")}
                  </pre>
                )}

                {tab === "headers" && (
                  <div className="overflow-x-auto">
                    {result.headers.length === 0 ? (
                      <p className="text-sm text-ink-soft">No headers: the request never reached the server.</p>
                    ) : (
                      <table className="w-full text-left font-mono text-sm">
                        <tbody>
                          {result.headers.map(([k, v]) => (
                            <tr key={k} className="border-b-2 border-dashed border-line/30">
                              <td className="py-1.5 pr-4 align-top font-bold text-orange">{k}</td>
                              <td className="py-1.5 break-all">{v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    <p className="mt-3 text-xs text-ink-soft">Browsers only expose CORS-safelisted headers to page scripts, so some server headers are hidden.</p>
                  </div>
                )}

                {tab === "code" && <CodeSnippets url={result.url} />}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------- Pieces ---------- */

function StatusDot({ status }: { status: Endpoint["status"] }) {
  const color = status === "live" ? "bg-[var(--green)]" : status === "unstable" ? "bg-yellow" : "bg-red";
  return <span title={status} className={`size-2.5 shrink-0 rounded-full border-[1.5px] border-[#15121a] ${color}`} />;
}

function StatusBadge({ endpoint }: { endpoint: Endpoint }) {
  const map = {
    live: { text: "Live", cls: "bg-[var(--green)] text-white" },
    unstable: { text: "Unstable", cls: "bg-yellow text-[#15121a]" },
    sealed: { text: "Sealed · 404", cls: "bg-red text-white" },
  }[endpoint.status];
  return (
    <span className={`rounded-sm border-2 border-[#15121a] px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider ${map.cls}`}>
      {map.text}
    </span>
  );
}

function ResultHeader({ result, count }: { result: ApiResult; count: number | null }) {
  const tone = result.status === 0 ? "net" : result.status >= 500 ? "boom" : result.status >= 400 ? "miss" : "hit";
  const sfx = { hit: "SUCCESS!", miss: "MISS!", boom: "KA-BOOM!", net: "POOF!" }[tone];
  const bg = { hit: "halftone-orange", miss: "bg-yellow", boom: "bg-red", net: "bg-ink-soft" }[tone];

  return (
    <div className={`panel relative flex flex-wrap items-center gap-x-6 gap-y-3 overflow-hidden px-4 py-3 ${tone !== "hit" ? "anim-shake" : ""}`}>
      <span
        key={result.at}
        style={{ ["--r" as string]: "-5deg" }}
        className={`sfx anim-pop rounded border-[3px] border-[#15121a] px-3 py-1 text-3xl text-white ${bg}`}
      >
        {sfx}
      </span>
      <Stat label="Status" value={result.status === 0 ? "—" : `${result.status} ${result.statusText}`} accent={tone === "hit" ? "text-[var(--green)]" : "text-red"} />
      <Stat label="Time" value={`${result.timeMs} ms`} />
      <Stat label="Size" value={formatBytes(result.sizeBytes)} />
      {count !== null && <Stat label="Items" value={String(count)} />}
      <Stat label="Type" value={result.contentType.split(";")[0] || "—"} />
    </div>
  );
}

function Stat({ label, value, accent = "" }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-soft">{label}</p>
      <p className={`font-mono text-base font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function ErrorExplainer({ result }: { result: ApiResult }) {
  let title = "Something went wrong";
  let hint = "Check the Raw tab for the exact response body.";
  if (result.status === 0) {
    title = result.statusText;
    hint = result.networkError ?? hint;
  } else if (result.status === 404) {
    title = "404: this jutsu doesn't exist (yet)";
    hint = "The server has no route at this path. Check spelling and capitalisation; route names are case-sensitive.";
  } else if (result.status === 504) {
    title = "504: the server ran out of chakra";
    hint = "The serverless function timed out before answering. Retrying sometimes helps once the function is warm.";
  } else if (result.status >= 500) {
    title = `${result.status}: server error`;
  } else if (!result.isJson) {
    title = "Not JSON";
    hint = "The server answered with something other than JSON. Raw tab shows exactly what came back.";
  }
  return (
    <div className="grid place-items-center py-10 text-center">
      <div className="bubble max-w-lg">
        <p className="display text-3xl">{title}</p>
        <p className="mt-1 text-sm text-ink-soft">{hint}</p>
      </div>
    </div>
  );
}

function LoadingPanel({ sfx }: { sfx: string }) {
  return (
    <div className="panel speedlines grid min-h-72 place-items-center p-8">
      <div className="flex flex-col items-center gap-5">
        <div className="rasengan" />
        <p className="sfx anim-pop text-5xl [--r:-4deg]">{sfx}</p>
        <p className="text-sm font-semibold text-ink-soft">Summoning a response…</p>
      </div>
    </div>
  );
}

function IdlePanel({ onSend, disabled }: { onSend: () => void; disabled: boolean }) {
  return (
    <div className="panel speedlines grid min-h-72 place-items-center p-8 text-center">
      <div className="bubble max-w-md">
        <p className="display text-3xl">Ready when you are, dattebayo!</p>
        <p className="mt-1 text-sm text-ink-soft">Pick an endpoint on the left or hit send to fire this one.</p>
        <button type="button" onClick={onSend} disabled={disabled} className="btn btn-orange display mt-4 text-xl tracking-wider">
          Send it!
        </button>
      </div>
    </div>
  );
}

function HistoryList({
  entries,
  onPick,
}: {
  entries: ReturnType<typeof useHistory>;
  onPick: (h: ReturnType<typeof useHistory>[number]) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="caption rotate-[1deg]">History</p>
        {entries.length > 0 && (
          <button type="button" onClick={clearHistory} className="text-xs font-bold text-ink-soft hover:text-red">
            Clear
          </button>
        )}
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-ink-soft">Requests you send show up here.</p>
      ) : (
        <ul className="space-y-1">
          {entries.slice(0, 12).map((h) => (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => onPick(h)}
                className="flex w-full items-center gap-2 rounded border-2 border-transparent px-2 py-1 text-left text-xs hover:border-line hover:bg-card"
                title={h.url}
              >
                <span className={`w-8 font-mono font-bold ${h.status >= 200 && h.status < 300 ? "text-[var(--green)]" : "text-red"}`}>
                  {h.status || "ERR"}
                </span>
                <span className="flex-1 truncate font-semibold">
                  {h.label}
                  {Object.values(h.params).length > 0 && <span className="text-ink-soft"> · {Object.values(h.params).join(", ")}</span>}
                </span>
                <span className="font-mono text-ink-soft">{h.timeMs}ms</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
