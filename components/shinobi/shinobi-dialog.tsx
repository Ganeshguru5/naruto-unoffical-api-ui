"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Shinobi } from "@/lib/request";
import { ShinobiImage } from "./shinobi-card";

export function ShinobiDialog({
  shinobi,
  onClose,
  onFetchOne,
}: {
  shinobi: Shinobi | null;
  onClose: () => void;
  /** Inside the playground, run the request in place instead of navigating. */
  onFetchOne?: (underscoredName: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (shinobi && !dialog.open) dialog.showModal();
    if (!shinobi && dialog.open) dialog.close();
  }, [shinobi]);

  const copyJson = async () => {
    if (!shinobi) return;
    await navigator.clipboard.writeText(JSON.stringify(shinobi, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(760px,calc(100vw-32px))] bg-transparent p-0 backdrop:bg-[#15121a]/70 backdrop:backdrop-blur-sm"
    >
      {shinobi && (
        <div className="panel anim-pop grid overflow-hidden text-ink [--r:0deg] sm:grid-cols-[260px_1fr]">
          <div className="relative border-b-[3px] border-line bg-paper-2 sm:border-b-0 sm:border-r-[3px]">
            <ShinobiImage src={shinobi.imagePro} name={shinobi.name} className="h-72 w-full sm:h-full" />
            <span className="sfx absolute -bottom-1 left-3 rotate-[-6deg] text-4xl">#{shinobi.id}</span>
          </div>
          <div className="flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="caption">Shinobi file</span>
                <h2 className="display mt-2 text-4xl">{shinobi.name}</h2>
                <code className="font-mono text-xs text-ink-soft">{shinobi.underscoredName}</code>
              </div>
              <button type="button" onClick={onClose} className="btn btn-plain px-2.5 py-1" aria-label="Close">
                ✕
              </button>
            </div>
            <p className="max-h-64 overflow-auto pr-1 text-sm leading-relaxed scrollbar-thin">{shinobi.description}</p>
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              {onFetchOne ? (
                <button
                  type="button"
                  onClick={() => {
                    onFetchOne(shinobi.underscoredName);
                    onClose();
                  }}
                  className="btn btn-orange text-sm"
                >
                  Fetch with /one_sinobi
                </button>
              ) : (
                <Link
                  href={`/playground?ep=one-shinobi&name=${encodeURIComponent(shinobi.underscoredName)}`}
                  onClick={onClose}
                  className="btn btn-orange text-sm"
                >
                  Fetch with /one_sinobi
                </Link>
              )}
              <button type="button" onClick={copyJson} className="btn btn-plain text-sm">
                {copied ? "Copied!" : "Copy JSON"}
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
