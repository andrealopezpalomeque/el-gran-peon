const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttl = DEFAULT_TTL) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
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
