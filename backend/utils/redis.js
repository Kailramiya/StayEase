const Redis = require('ioredis');

const enabled = (process.env.REDIS_ENABLED || 'true').toLowerCase() !== 'false';
let redis;

if (enabled) {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      return Math.min(times * 200, 2000); // backoff up to 2s
    },
  });

  redis.on('error', (err) => {
    const msg = (err && err.message) ? err.message : String(err);
    console.error('Redis error:', msg);
  });

  redis.on('connect', () => {
    console.log('Redis connected');
  });
} else {
  // No-op stub to allow code paths without Redis
  redis = {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 0,
    scanStream: () => ({
      on: (evt, cb) => {
        if (evt === 'end') setImmediate(cb);
      },
    }),
    status: 'disabled',
  };
}

module.exports = redis;
