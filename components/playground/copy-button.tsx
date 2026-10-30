"use client";

import { useState } from "react";

export function CopyButton({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1200);
    } catch {
      // Clipboard can be denied (insecure context or permissions); nothing to recover.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={`rounded border-2 border-[#15121a] px-2 py-0.5 text-xs font-bold text-[#15121a] shadow-[2px_2px_0_#15121a] transition-colors ${
        done ? "bg-[var(--green)] text-white" : "bg-yellow"
      } ${className}`}
    >
      {done ? "Copied!" : label}
    </button>
  );
}
