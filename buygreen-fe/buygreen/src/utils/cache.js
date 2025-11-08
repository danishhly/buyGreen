/**
 * Simple in-memory cache utility for API responses
 */

class SimpleCache {
    constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default TTL
        this.cache = new Map();
        this.defaultTTL = defaultTTL;
    }

    /**
     * Generate a cache key from URL and params
     */
    generateKey(url, params = {}) {
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');
        return `${url}${sortedParams ? `?${sortedParams}` : ''}`;
    }

    /**
     * Get cached data
     */
    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            return null;
        }

        // Check if expired
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    /**
     * Set cached data
     */
    set(key, data, ttl = this.defaultTTL) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttl
        });
    }

    /**
     * Clear specific key or all cache
     */
    clear(key = null) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Clear expired entries
     */
    clearExpired() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
            }
        }
    }
}

// Create a singleton instance
const cache = new SimpleCache();

// Clean up expired entries every 10 minutes
if (typeof window !== 'undefined') {
    setInterval(() => {
        cache.clearExpired();
    }, 10 * 60 * 1000);
}

export default cache;

