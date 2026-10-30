"use client";

import { useState } from "react";
import { type Shinobi, usableImage } from "@/lib/request";

const TILTS = ["-1.5deg", "1deg", "-0.5deg", "1.5deg", "0deg", "-1deg"];

export function ShinobiImage({
  src,
  name,
  className = "",
}: {
  src: string | undefined;
  name: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const url = usableImage(src);

  if (!url || broken) {
    return (
      <div className={`halftone-orange grid place-items-center ${className}`}>
        <span className="display text-5xl text-[#15121a]/80">{initials(name)}</span>
      </div>
    );
  }

  return (
    // Wikia images come from many hosts and sizes; a plain img avoids remote-pattern config.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={name}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
      className={`object-cover object-top ${className}`}
    />
  );
}

function initials(name: string) {
  return name
    .split(/[\s_]+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function ShinobiCard({
  shinobi,
  index,
  onOpen,
}: {
  shinobi: Shinobi;
  index: number;
  onOpen: (s: Shinobi) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(shinobi)}
      style={{ ["--r" as string]: TILTS[index % TILTS.length], animationDelay: `${Math.min(index, 12) * 40}ms` }}
      className="panel-sm anim-up group flex flex-col overflow-hidden text-left transition-transform [transform:rotate(var(--r))] hover:z-10 hover:[transform:rotate(0deg)_scale(1.03)]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden border-b-[2.5px] border-line bg-paper-2">
        <ShinobiImage src={shinobi.imagePro} name={shinobi.name} className="size-full transition-transform duration-300 group-hover:scale-105" />
        <span className="absolute right-2 top-2 rounded-sm border-2 border-[#15121a] bg-yellow px-1.5 font-mono text-[10px] font-bold text-[#15121a]">
          #{shinobi.id}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <p className="display text-xl leading-tight tracking-wide">{shinobi.name}</p>
        <p className="line-clamp-2 text-xs text-ink-soft">{shinobi.description}</p>
      </div>
    </button>
  );
}
