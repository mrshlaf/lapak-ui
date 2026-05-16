import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 1,
    connectTimeout: 1000,
    retryStrategy(times) {
      if (times > 2) return null; // stop retrying after 2 attempts
      return Math.min(times * 50, 1000);
    },
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

/**
 * Utility to delete keys by pattern (e.g., "products:*")
 * Useful for cache invalidation when data changes.
 */
export const delByPattern = async (pattern: string) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (e) {
    console.error("Redis delByPattern error:", e);
  }
};
