export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function appendQueryParams(url: string, params: Array<{ key: string; value: string; enabled: boolean }>) {
  const parsed = new URL(url);
  for (const param of params) {
    if (param.enabled && param.key.trim()) {
      parsed.searchParams.append(param.key.trim(), param.value);
    }
  }
  return parsed.toString();
}
