// In-memory per-IP sliding window. Generous by design: the point is to cap abuse
// and the API bill, not to gate real use. State is per serverless instance, which
// is fine for a demo. The route fails soft when this returns false, returning a
// cached policy instead of an error.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 30;
const hits = new Map<string, number[]>();

export function rateLimit(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
}
