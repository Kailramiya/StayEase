const Redis = require('ioredis');

const enabled = (process.env.REDIS_ENABLED || 'true').toLowerCase() !== 'false';
let redis;

if (enabled) {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const isSecure = redisUrl.startsWith('rediss://');
  const baseOptions = {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      return Math.min(times * 200, 2000); // backoff up to 2s
    },
  };
  const options = isSecure
    ? { ...baseOptions, tls: { rejectUnauthorized: false } }
    : baseOptions;

  redis = new Redis(redisUrl, options);

  redis.on('error', (err) => {
    const msg = (err && err.message) ? err.message : String(err);
    // AggregateError commonly arises from multiple underlying errors; log first cause if present
    if (err && err.errors && err.errors.length) {
      console.error('Redis error (Aggregate):', err.errors[0]?.message || msg);
    } else {
      console.error('Redis error:', msg);
    }
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
