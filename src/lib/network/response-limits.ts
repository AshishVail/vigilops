import "server-only";

export const MAX_RESPONSE_BODY_BYTES = 1_048_576;

export async function readLimitedResponse(
  response: Response,
  maxBytes = MAX_RESPONSE_BODY_BYTES,
): Promise<{ text: string; sizeBytes: number; truncated: boolean }> {
  const declaredSize = Number(response.headers.get("content-length") ?? 0);
  if (declaredSize > maxBytes) {
    await response.body?.cancel();
    return { text: "", sizeBytes: declaredSize, truncated: true };
  }

  const reader = response.body?.getReader();
  if (!reader) return { text: "", sizeBytes: 0, truncated: false };

  const chunks: Uint8Array[] = [];
  let size = 0;
  let truncated = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const remaining = maxBytes - size;
    if (value.byteLength > remaining) {
      chunks.push(value.slice(0, Math.max(0, remaining)));
      size += Math.max(0, remaining);
      truncated = true;
      await reader.cancel();
      break;
    }
    chunks.push(value);
    size += value.byteLength;
  }

  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return { text: new TextDecoder("utf-8", { fatal: false }).decode(result), sizeBytes: size, truncated };
}
