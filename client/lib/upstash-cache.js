import { Redis } from "@upstash/redis";

let redisInstance;

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  if (!redisInstance) {
    redisInstance = Redis.fromEnv();
  }

  return redisInstance;
}

export async function withRedisCache(key, ttlSeconds, loader) {
  const redis = getRedis();

  if (!redis) {
    const value = await loader();
    return {
      value,
      cache: {
        provider: "none",
        status: "disabled",
        hit: false,
        key,
      },
    };
  }

  try {
    const cached = await redis.get(key);

    if (cached !== null && cached !== undefined) {
      return {
        value: cached,
        cache: {
          provider: "upstash",
          status: "hit",
          hit: true,
          key,
          ttlSeconds,
        },
      };
    }
  } catch (error) {
    const value = await loader();
    return {
      value,
      cache: {
        provider: "upstash",
        status: "read_error",
        hit: false,
        key,
        ttlSeconds,
        error: error instanceof Error ? error.message : "Redis read failed",
      },
    };
  }

  const value = await loader();

  try {
    await redis.set(key, value, { ex: ttlSeconds });

    return {
      value,
      cache: {
        provider: "upstash",
        status: "miss",
        hit: false,
        key,
        ttlSeconds,
      },
    };
  } catch (error) {
    return {
      value,
      cache: {
        provider: "upstash",
        status: "write_error",
        hit: false,
        key,
        ttlSeconds,
        error: error instanceof Error ? error.message : "Redis write failed",
      },
    };
  }
}
