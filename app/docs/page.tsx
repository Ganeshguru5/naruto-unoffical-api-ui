import type { Metadata } from "next";
import Link from "next/link";
import { API_BASE, CATEGORIES, ENDPOINTS, SCHEMAS } from "@/lib/endpoints";

export const metadata: Metadata = {
  title: "Docs",
  description: "Reference for every Naruto Unofficial API endpoint: paths, parameters and response shapes.",
};

const STATUS_STYLE = {
  live: "bg-[var(--green)] text-white",
  unstable: "bg-yellow text-[#15121a]",
  sealed: "bg-red text-white",
} as const;

export default function DocsPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav className="hidden lg:block">
        <div className="sticky top-24 space-y-5">
          {CATEGORIES.map((cat) => (
            <div key={cat}>
              <p className="caption mb-2">{cat}</p>
              <ul className="space-y-1 text-sm font-semibold">
                {ENDPOINTS.filter((e) => e.category === cat).map((e) => (
                  <li key={e.id}>
                    <a href={`#${e.id}`} className="block rounded px-2 py-1 hover:bg-card">
                      {e.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="min-w-0 space-y-10">
        <header className="panel halftone overflow-hidden bg-paper-2 p-6">
          <span className="caption">Chapter 1 · The scroll of endpoints</span>
          <h1 className="display mt-3 text-5xl sm:text-6xl">API Reference</h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Every endpoint is a plain <code className="font-mono">GET</code> request that returns JSON. No API key, no
            auth, and CORS is open, so you can call it straight from the browser.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 rounded border-[2.5px] border-line bg-card p-3">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">Base URL</span>
            <code className="break-all font-mono text-sm">{API_BASE}</code>
          </div>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            <Rule title="Exact names">Path values are case-sensitive and use underscores: <code className="font-mono">Naruto_Uzumaki</code>.</Rule>
            <Rule title="Empty ≠ error">An unknown name returns <code className="font-mono">200</code> with <code className="font-mono">[]</code>, not a 404.</Rule>
            <Rule title="Cold starts">The server is serverless; the first call after a quiet spell can take a few seconds.</Rule>
          </div>
        </header>

        {CATEGORIES.map((cat) => (
          <section key={cat} className="space-y-6">
            <h2 className="display text-4xl">{cat}</h2>
            {ENDPOINTS.filter((e) => e.category === cat).map((e) => {
              const example = `${API_BASE}${e.path.replace(/\{(\w+)\}/g, (_, k: string) => e.params.find((p) => p.name === k)?.example ?? k)}`;
              return (
                <article key={e.id} id={e.id} className="panel scroll-mt-24 overflow-hidden">
                  <div className="flex flex-wrap items-center gap-3 border-b-[3px] border-line bg-paper-2 px-4 py-3">
                    <span className="method-get">GET</span>
                    <code className="font-mono text-base font-bold break-all">{e.path}</code>
                    <span className={`ml-auto rounded-sm border-2 border-[#15121a] px-2 py-0.5 text-xs font-extrabold uppercase ${STATUS_STYLE[e.status]}`}>
                      {e.status}
                    </span>
                  </div>
                  <div className="grid gap-5 p-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <h3 className="display text-3xl">{e.name}</h3>
                      <p className="text-sm text-ink-soft">{e.description}</p>
                      {e.statusNote && <p className="text-sm font-semibold text-red">⚠ {e.statusNote}</p>}
                      {e.params.length > 0 && (
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b-2 border-line text-xs uppercase tracking-wider text-ink-soft">
                              <th className="py-1">Param</th>
                              <th className="py-1">In</th>
                              <th className="py-1">Example</th>
                            </tr>
                          </thead>
                          <tbody>
                            {e.params.map((p) => (
                              <tr key={p.name}>
                                <td className="py-1.5 font-mono font-bold text-orange">{p.name}</td>
                                <td className="py-1.5">path</td>
                                <td className="py-1.5 font-mono">{p.example}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      <Link href={`/playground?ep=${e.id}`} className="btn btn-orange display mt-2 text-lg tracking-wider">
                        Try it live →
                      </Link>
                    </div>
                    <div className="min-w-0 space-y-3">
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-ink-soft">Example</p>
                        <pre className="overflow-x-auto rounded border-2 border-line bg-code p-3 font-mono text-xs text-code-fg">
                          curl &quot;{example}&quot;
                        </pre>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-ink-soft">Response</p>
                        <pre className="overflow-x-auto rounded border-2 border-line bg-code p-3 font-mono text-xs text-code-fg">{SCHEMAS[e.kind]}</pre>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}

function Rule({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel-sm p-3">
      <p className="display text-xl">{title}</p>
      <p className="text-ink-soft">{children}</p>
    </div>
  );
}
