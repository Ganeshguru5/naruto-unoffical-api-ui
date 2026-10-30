"use client";

import { useSyncExternalStore } from "react";

export interface HistoryEntry {
  id: string;
  endpointId: string | null;
  label: string;
  url: string;
  params: Record<string, string>;
  status: number;
  timeMs: number;
  at: number;
}

const KEY = "naruto-api-history";
const MAX = 25;
const EMPTY: HistoryEntry[] = [];

let cache: HistoryEntry[] | null = null;
const listeners = new Set<() => void>();

function load(): HistoryEntry[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function save(next: HistoryEntry[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage may be full or blocked; history still lives for this visit.
  }
  listeners.forEach((l) => l());
}

export function addHistory(entry: Omit<HistoryEntry, "id">) {
  save([{ ...entry, id: `${entry.at}-${Math.random().toString(36).slice(2, 7)}` }, ...load()].slice(0, MAX));
}

export function clearHistory() {
  save([]);
}

export function useHistory() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    load,
    () => EMPTY,
  );
}
