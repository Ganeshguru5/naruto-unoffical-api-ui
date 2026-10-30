import Link from "next/link";
import { API_BASE, ENDPOINTS } from "@/lib/endpoints";
import { LiveSummon } from "@/components/home/live-summon";

const STEPS = [
  {
    n: "01",
    sfx: "SNAP!",
    title: "Pick a scroll",
    text: "Choose any endpoint: shinobi, crews like the Akatsuki, kages or entire clans.",
  },
  {
    n: "02",
    sfx: "WHOOSH!",
    title: "Fire the request",
    text: "Fill the path params, or tap a suggestion, and send a live GET from your browser.",
  },
  {
    n: "03",
    sfx: "BAM!",
    title: "Read the results",
    text: "Flip between character cards, a searchable JSON tree, raw body, headers and code.",
  },
];

export default function Home() {
  const live = ENDPOINTS.filter((e) => e.status !== "sealed");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      {/* ---------- Page 1: hero spread ---------- */}
      <section className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="panel halftone-orange relative overflow-hidden p-6 sm:p-10">
          <div className="speedlines pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative">
            <span className="caption rotate-[-2deg]">Volume 2 · The API strikes back</span>
            <h1 className="display mt-5 text-6xl text-[#15121a] sm:text-7xl xl:text-8xl">
              The shinobi world,
              <br />
              <span className="sfx inline-block rotate-[-3deg] text-white">one request</span> away.
            </h1>

            <div className="bubble mt-8 max-w-md text-ink">
              <p className="font-semibold">
                A free REST API with over a thousand shinobi, 34 clans, the Akatsuki, jinchūriki and kages.
                No key, no sign-up. Believe it!
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/playground" className="btn btn-ink display text-2xl tracking-wider">
                Open the playground →
              </Link>
              <Link href="/docs" className="btn btn-plain display text-2xl tracking-wider">
                Read the docs
              </Link>
            </div>
          </div>
        </div>

        <LiveSummon />
      </section>

      {/* ---------- Page 2: three-panel strip ---------- */}
      <section className="mt-14">
        <h2 className="display mb-5 text-5xl">How it works</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className="panel relative overflow-hidden p-5 pt-10"
              style={{ transform: `rotate(${[-1, 0.6, -0.4][i]}deg)` }}
            >
              <span className="absolute left-0 top-0 border-b-[3px] border-r-[3px] border-line bg-yellow px-3 py-1 font-mono text-sm font-bold text-[#15121a]">
                {s.n}
              </span>
              <span className="sfx absolute right-3 top-2 rotate-[8deg] text-3xl">{s.sfx}</span>
              <h3 className="display text-3xl">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Page 3: endpoint index ---------- */}
      <section className="mt-16">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h2 className="display text-5xl">Every jutsu in the scroll</h2>
          <code className="rounded border-2 border-line bg-card px-2 py-1 font-mono text-xs">{API_BASE}</code>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {live.map((e) => (
            <Link
              key={e.id}
              href={`/playground?ep=${e.id}`}
              className="panel-sm group relative flex flex-col gap-2 overflow-hidden p-4 transition-transform hover:-translate-y-1 hover:rotate-[-0.6deg]"
            >
              <span className="sfx pointer-events-none absolute -right-2 -top-1 rotate-[8deg] text-2xl opacity-0 transition-opacity group-hover:opacity-100">
                {e.sfx}
              </span>
              <div className="flex items-center gap-2">
                <span className="method-get">GET</span>
                <code className="truncate font-mono text-sm font-bold">{e.path}</code>
              </div>
              <p className="display text-2xl">{e.name}</p>
              <p className="text-sm text-ink-soft">{e.summary}</p>
              <span className="mt-auto pt-1 text-xs font-bold text-orange">Try it live →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Page 4: quick start ---------- */}
      <section className="mt-16 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="panel halftone-blue p-6 text-white">
          <span className="caption">Quick start</span>
          <h2 className="display mt-4 text-5xl">Three lines. That&apos;s the whole jutsu.</h2>
          <p className="mt-3 max-w-md text-white/90">
            CORS is open, so this runs as-is in a browser, Node, Deno or Bun.
          </p>
        </div>
        <pre className="panel overflow-x-auto bg-code p-6 font-mono text-sm leading-relaxed text-code-fg">
          <span className="text-[#9b93a8]">{"// Fetch the Seventh Hokage\n"}</span>
          <span className="text-[#ffb27a]">const</span> res = <span className="text-[#ffb27a]">await</span> fetch(
          <span className="text-[#a6e3a1]">{`"${API_BASE}/one_sinobi/Naruto_Uzumaki"`}</span>);{"\n"}
          <span className="text-[#ffb27a]">const</span> [naruto] = <span className="text-[#ffb27a]">await</span> res.json();{"\n"}
          console.log(naruto.name); <span className="text-[#9b93a8]">{"// → \"Naruto Uzumaki\""}</span>
        </pre>
      </section>
    </div>
  );
}
