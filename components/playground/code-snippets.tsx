"use client";

import { useState } from "react";
import { snippets } from "@/lib/request";
import { CopyButton } from "./copy-button";

const LANGS = [
  { id: "curl", label: "cURL" },
  { id: "fetch", label: "JS fetch" },
  { id: "axios", label: "Axios" },
  { id: "python", label: "Python" },
] as const;

export function CodeSnippets({ url }: { url: string }) {
  const [lang, setLang] = useState<(typeof LANGS)[number]["id"]>("curl");
  const code = snippets(url)[lang];

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {LANGS.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLang(l.id)}
            className={`chip ${lang === l.id ? "!bg-orange text-[#15121a]" : ""}`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="relative rounded border-[2.5px] border-line bg-code">
        <CopyButton text={code} className="absolute right-2 top-2" />
        <pre className="overflow-x-auto p-4 pr-20 font-mono text-[0.82rem] leading-relaxed text-code-fg scrollbar-thin">
          {code}
        </pre>
      </div>
    </div>
  );
}
