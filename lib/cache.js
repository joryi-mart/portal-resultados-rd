// lib/cache.js
// Caché simple en memoria con expiración (TTL)

const cache = new Map();

export function setCache(key, data, ttlMs = 5 * 60 * 1000) {
  cache.set(key, { data, expira: Date.now() + ttlMs });
}

export function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expira) {
    cache.delete(key);
    return null;
  }
  return item.data;
}