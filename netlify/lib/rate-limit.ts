// Per-IP rate limit: RATE_LIMIT attempts per RATE_WINDOW_MS. Only a SHA-256 hash of the IP is stored.
import { createHash } from 'node:crypto';
import type { RateLimiter } from './enquiry-handler.ts';

export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 10 * 60 * 1000;

export const hashKey = (ip: string): string => createHash('sha256').update(`mm-contact:${ip}`).digest('hex');

/** In-process limiter: used in tests, and as a fallback if the shared store is unavailable. */
export class MemoryRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, number[]>();
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly now: () => number;

  constructor(limit = RATE_LIMIT, windowMs = RATE_WINDOW_MS, now: () => number = Date.now) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.now = now;
  }

  async allow(ip: string): Promise<boolean> {
    const key = hashKey(ip);
    const now = this.now();
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    const allowed = recent.length < this.limit;
    this.hits.set(key, allowed ? [...recent, now] : recent);
    return allowed;
  }
}

interface TimestampStore {
  get(key: string, options: { type: 'json' }): Promise<unknown>;
  setJSON(key: string, value: unknown): Promise<unknown>;
}

/** Shared limiter backed by Netlify Blobs, so the limit holds across function instances. */
export class StoreRateLimiter implements RateLimiter {
  private readonly store: TimestampStore;
  private readonly fallback: RateLimiter;
  private readonly now: () => number;

  constructor(store: TimestampStore, fallback: RateLimiter = new MemoryRateLimiter(), now: () => number = Date.now) {
    this.store = store;
    this.fallback = fallback;
    this.now = now;
  }

  async allow(ip: string): Promise<boolean> {
    try {
      const key = hashKey(ip);
      const now = this.now();
      const stored = await this.store.get(key, { type: 'json' });
      const recent = (Array.isArray(stored) ? stored : []).filter((t): t is number => typeof t === 'number' && now - t < RATE_WINDOW_MS);
      if (recent.length >= RATE_LIMIT) return false;
      await this.store.setJSON(key, [...recent, now]);
      return true;
    } catch {
      return this.fallback.allow(ip);
    }
  }
}
