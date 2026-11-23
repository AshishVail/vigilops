import "server-only";
import dns from "node:dns/promises";

export type ResolvedAddress = {
  address: string;
  family: 4 | 6;
};

export async function resolveHostname(hostname: string): Promise<ResolvedAddress[]> {
  const result = await dns.lookup(hostname, { all: true, verbatim: true });
  return result.map((entry) => ({
    address: entry.address,
    family: entry.family as 4 | 6,
  }));
}
