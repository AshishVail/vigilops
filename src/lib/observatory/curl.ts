export type CurlDraft = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  url: string;
  queryParams?: Array<{ key: string; value: string; enabled: boolean }>;
  headers?: Record<string, string>;
  body?: string | null;
};

function shellQuote(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

export function buildCurlCommand(draft: CurlDraft) {
  if (!draft.url.trim()) return "curl --request GET";
  const url = new URL(draft.url);
  for (const param of draft.queryParams ?? []) {
    if (param.enabled && param.key.trim()) url.searchParams.append(param.key.trim(), param.value);
  }
  const parts = ["curl", "--request", draft.method, "--url", shellQuote(url.toString())];
  for (const [name, value] of Object.entries(draft.headers ?? {})) {
    parts.push("--header", shellQuote(`${name}: ${value}`));
  }
  if (draft.body && draft.method !== "GET" && draft.method !== "HEAD") {
    parts.push("--data-raw", shellQuote(draft.body));
  }
  return parts.join(" \\\n  ");
}
