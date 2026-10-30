export interface ApiResult {
  url: string;
  status: number;
  statusText: string;
  ok: boolean;
  timeMs: number;
  sizeBytes: number;
  contentType: string;
  headers: [string, string][];
  body: unknown;
  rawText: string;
  isJson: boolean;
  networkError?: string;
  at: number;
}

const TIMEOUT_MS = 20000;

export async function runRequest(url: string, signal?: AbortSignal): Promise<ApiResult> {
  const started = performance.now();
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

  try {
    const res = await fetch(url, { method: "GET", signal: combined, cache: "no-store" });
    const rawText = await res.text();
    const timeMs = Math.round(performance.now() - started);
    const contentType = res.headers.get("content-type") ?? "";
    let body: unknown = rawText;
    let isJson = false;
    try {
      body = JSON.parse(rawText);
      isJson = true;
    } catch {
      // Not JSON: keep the raw text so the viewer can still show it.
    }
    return {
      url,
      status: res.status,
      statusText: res.statusText || defaultStatusText(res.status),
      ok: res.ok,
      timeMs,
      sizeBytes: new TextEncoder().encode(rawText).length,
      contentType,
      headers: [...res.headers.entries()],
      body,
      rawText,
      isJson,
      at: Date.now(),
    };
  } catch (err) {
    const timedOut = timeout.aborted;
    return {
      url,
      status: 0,
      statusText: timedOut ? "Timed out" : "Network error",
      ok: false,
      timeMs: Math.round(performance.now() - started),
      sizeBytes: 0,
      contentType: "",
      headers: [],
      body: null,
      rawText: "",
      isJson: false,
      networkError: timedOut
        ? `No answer after ${TIMEOUT_MS / 1000}s. The server may be cold-starting or overloaded.`
        : err instanceof Error
          ? err.message
          : String(err),
      at: Date.now(),
    };
  }
}

function defaultStatusText(status: number) {
  const map: Record<number, string> = {
    200: "OK",
    304: "Not Modified",
    400: "Bad Request",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    504: "Gateway Timeout",
  };
  return map[status] ?? "";
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export interface Shinobi {
  id: number;
  name: string;
  underscoredName: string;
  description: string;
  imagePro: string;
}

export interface Clan {
  clan: string;
  description: string;
  img: string;
  members: Shinobi[];
}

export function isShinobi(v: unknown): v is Shinobi {
  return typeof v === "object" && v !== null && "name" in v && "underscoredName" in v;
}

export function isClan(v: unknown): v is Clan {
  return typeof v === "object" && v !== null && "clan" in v && "members" in v;
}

// Wikia sometimes hands back a 1x1 lazy-load gif instead of a real image.
export function usableImage(src: string | undefined) {
  if (!src || src.startsWith("data:")) return null;
  return src;
}

export function snippets(url: string) {
  return {
    curl: `curl -X GET "${url}" \\\n  -H "Accept: application/json"`,
    fetch: `const res = await fetch("${url}");\nif (!res.ok) throw new Error(\`HTTP \${res.status}\`);\nconst data = await res.json();\nconsole.log(data);`,
    axios: `import axios from "axios";\n\nconst { data } = await axios.get("${url}");\nconsole.log(data);`,
    python: `import requests\n\nres = requests.get("${url}", timeout=20)\nres.raise_for_status()\nprint(res.json())`,
  };
}
