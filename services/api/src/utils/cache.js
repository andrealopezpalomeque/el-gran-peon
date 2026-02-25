const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const STALE_TTL = 60 * 60 * 1000; // 1 hour for stale fallback

class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) return null;
    return entry.value;
  }

  // Returns data even if expired — used as fallback when Firestore is down
  getStale(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.staleAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttl = DEFAULT_TTL) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      staleAt: Date.now() + STALE_TTL,
    });
  }

  invalidatePrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  clear() {
    this.store.clear();
  }
}

export const cache = new MemoryCache();

// Retry a Firestore operation with exponential backoff for RESOURCE_EXHAUSTED
export async function withRetry(fn, { retries = 3, baseDelay = 1000 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isQuotaError = error.code === 8 || error.details === 'Quota exceeded.';
      if (!isQuotaError || attempt === retries) throw error;
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
