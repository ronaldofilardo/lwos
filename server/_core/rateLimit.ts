export class RateLimitError extends Error {
  constructor() {
    super("Muitas tentativas. Tente novamente mais tarde.");
    this.name = "RateLimitError";
  }
}

export const RATE_LIMIT_MAX_KEYS = 10_000;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

const entries = new Map<string, { count: number; resetAt: number }>();

function cleanupExpired(now: number): void {
  entries.forEach((entry, key) => {
    if (now > entry.resetAt) entries.delete(key);
  });
}

function evictIfNeeded(now: number): void {
  if (entries.size < RATE_LIMIT_MAX_KEYS) return;
  cleanupExpired(now);
  while (entries.size >= RATE_LIMIT_MAX_KEYS) {
    const oldest = entries.keys().next();
    if (oldest.done) break;
    entries.delete(oldest.value);
  }
}

export function checkRateLimit(key: string, maxAttempts = 10, windowMs = 60_000): void {
  const now = Date.now();
  const entry = entries.get(key);
  if (!entry || now > entry.resetAt) {
    evictIfNeeded(now);
    entries.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  entry.count++;
  if (entry.count > maxAttempts) throw new RateLimitError();
}

export function resetRateLimit(key: string): void {
  entries.delete(key);
}

export function resetRateLimits(): void {
  entries.clear();
}

const cleanupTimer = setInterval(() => cleanupExpired(Date.now()), CLEANUP_INTERVAL_MS) as {
  unref?: () => void;
};
cleanupTimer.unref?.();
