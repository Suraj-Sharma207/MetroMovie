import NodeCache from 'node-cache';

/**
 * In-memory TTL Cache Service.
 * Acts as an abstraction layer so that caching does not fail hard if errors occur.
 * Designed with standard get/set/del interface so it can be swapped with Redis if needed.
 */
class CacheService {
  constructor() {
    // stdTTL: 600s (10 min default), checkperiod: 120s
    this.cache = new NodeCache({
      stdTTL: 600,
      checkperiod: 120,
      useClones: false
    });

    this.cache.on('expired', (key) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cache Expired] Key: ${key}`);
      }
    });
  }

  /**
   * Retrieve cached value by key.
   * Never throws; returns null on error or cache miss.
   */
  get(key) {
    try {
      const value = this.cache.get(key);
      if (value !== undefined) {
        return value;
      }
      return null;
    } catch (err) {
      console.warn(`[Cache Error] Failed to get key "${key}":`, err.message);
      return null;
    }
  }

  /**
   * Set a cached value with custom TTL in seconds.
   */
  set(key, value, ttlSeconds) {
    try {
      if (ttlSeconds !== undefined) {
        return this.cache.set(key, value, ttlSeconds);
      }
      return this.cache.set(key, value);
    } catch (err) {
      console.warn(`[Cache Error] Failed to set key "${key}":`, err.message);
      return false;
    }
  }

  /**
   * Delete an item from cache.
   */
  del(key) {
    try {
      return this.cache.del(key);
    } catch (err) {
      console.warn(`[Cache Error] Failed to delete key "${key}":`, err.message);
      return 0;
    }
  }

  /**
   * Check if key exists.
   */
  has(key) {
    try {
      return this.cache.has(key);
    } catch (err) {
      return false;
    }
  }

  /**
   * Flush the entire cache.
   */
  flush() {
    try {
      this.cache.flushAll();
    } catch (err) {
      console.warn('[Cache Error] Failed to flush cache:', err.message);
    }
  }
}

export const cacheService = new CacheService();
