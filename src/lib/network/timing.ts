export type HttpTiming = {
  dnsMs: number;
  connectMs: number;
  ttfbMs: number;
  downloadMs: number;
  totalMs: number;
};

export function createTiming(): HttpTiming {
  return { dnsMs: 0, connectMs: 0, ttfbMs: 0, downloadMs: 0, totalMs: 0 };
}
