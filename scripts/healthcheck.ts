const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const response = await fetch(new URL("/api/health", appUrl), {
  headers: { Accept: "application/json" },
  signal: AbortSignal.timeout(10000),
});
const body = await response.text();
if (!response.ok) {
  console.error(`VigilOps health check failed (${response.status}): ${body}`);
  process.exit(1);
}
console.log(body);
export {};
