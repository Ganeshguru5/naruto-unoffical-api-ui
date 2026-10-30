import Link from "next/link";
import { API_BASE } from "@/lib/endpoints";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-[3px] border-line bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="display text-3xl text-orange">To be continued…</p>
          <p className="mt-2 max-w-md text-sm opacity-80">
            A fan-made, unofficial API. Not affiliated with Masashi Kishimoto, Shueisha or
            Studio Pierrot. Character data and images come from the Naruto Fandom wiki.
          </p>
        </div>
        <div className="text-sm">
          <p className="display mb-2 text-xl tracking-wider">Explore</p>
          <ul className="space-y-1 opacity-85">
            <li><Link className="hover:text-orange" href="/playground">Playground</Link></li>
            <li><Link className="hover:text-orange" href="/docs">Endpoint docs</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="display mb-2 text-xl tracking-wider">Base URL</p>
          <code className="block break-all font-mono text-xs opacity-85">{API_BASE}</code>
        </div>
      </div>
    </footer>
  );
}
