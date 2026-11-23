export function formatBytes(bytes: number | null | undefined, decimals = 2) {
  if (bytes == null || !Number.isFinite(bytes)) return "0 B";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;
  return `${value.toFixed(decimals).replace(/\.?0+$/, "")} ${units[unitIndex]}`;
}

export function formatMilliseconds(milliseconds: number | null | undefined) {
  if (milliseconds == null || !Number.isFinite(milliseconds)) return "—";
  if (milliseconds < 1000) return `${Math.round(milliseconds)} ms`;
  return `${(milliseconds / 1000).toFixed(2)} s`;
}

export function formatDate(value: string | number | Date, includeTime = true) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    ...(includeTime
      ? { hour: "2-digit", minute: "2-digit", second: "2-digit" }
      : {}),
  }).format(date);
}
