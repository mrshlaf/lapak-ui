import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  (() => {
    if (!process.env.REDIS_URL) {
      console.warn("REDIS_URL is missing. Redis features are disabled.");
      return null as any;
    }
    return new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy(times) {
        if (times > 2) return null;
        return Math.min(times * 50, 1000);
      },
    });
  })();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

/**
 * Utility to delete keys by pattern (e.g., "products:*")
 * Useful for cache invalidation when data changes.
 */
export const delByPattern = async (pattern: string) => {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (e) {
    console.error("Redis delByPattern error:", e);
  }
};
