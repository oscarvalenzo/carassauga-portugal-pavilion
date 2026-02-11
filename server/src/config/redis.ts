import Redis from 'ioredis';

// Create Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redis.on('ready', () => {
  console.log('🔥 Redis is ready to accept commands');
});

// Helper functions for common Redis operations

// Set value with expiration
export const setWithExpiry = async (key: string, value: string, expirySeconds: number) => {
  await redis.setex(key, expirySeconds, value);
};

// Get value
export const get = async (key: string): Promise<string | null> => {
  return await redis.get(key);
};

// Delete key
export const del = async (key: string) => {
  await redis.del(key);
};

// Check if key exists
export const exists = async (key: string): Promise<boolean> => {
  const result = await redis.exists(key);
  return result === 1;
};

// Increment counter
export const incr = async (key: string): Promise<number> => {
  return await redis.incr(key);
};

// Add to sorted set (for leaderboard)
export const zadd = async (key: string, score: number, member: string) => {
  await redis.zadd(key, score, member);
};

// Get sorted set range (for leaderboard)
export const zrevrange = async (key: string, start: number, stop: number): Promise<string[]> => {
  return await redis.zrevrange(key, start, stop);
};

// Get rank in sorted set
export const zrevrank = async (key: string, member: string): Promise<number | null> => {
  return await redis.zrevrank(key, member);
};

// Queue operations (for virtual queue)
export const lpush = async (key: string, value: string) => {
  await redis.lpush(key, value);
};

export const rpop = async (key: string): Promise<string | null> => {
  return await redis.rpop(key);
};

export const llen = async (key: string): Promise<number> => {
  return await redis.llen(key);
};

export const lrange = async (key: string, start: number, stop: number): Promise<string[]> => {
  return await redis.lrange(key, start, stop);
};

export default redis;

