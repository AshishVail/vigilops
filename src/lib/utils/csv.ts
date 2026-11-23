export function csvEscape(value: unknown) {
  if (value == null) return "";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function rowsToCsv(headers: string[], rows: Array<Array<unknown>>) {
  const line = (values: unknown[]) => values.map(csvEscape).join(",");
  return [line(headers), ...rows.map(line)].join("\r\n");
}
