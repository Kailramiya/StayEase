const Redis = require('ioredis');

// Enable Redis only if explicitly set via REDIS_ENABLED=true or when REDIS_URL exists
const enabledEnv = (process.env.REDIS_ENABLED || '').toLowerCase();
const hasUrl = !!process.env.REDIS_URL && process.env.REDIS_URL.trim() !== '';
const enabled = enabledEnv === 'true' || (hasUrl && enabledEnv !== 'false');

let redis;

// Construct a safe no-op stub to allow code paths without Redis
const makeStub = () => ({
  get: async () => null,
  set: async () => 'OK',
  del: async () => 0,
  scanStream: () => ({
    on: (evt, cb) => {
      if (evt === 'end') setImmediate(cb);
    },
  }),
  pipeline: () => ({
    del: () => {},
    exec: async () => [],
  }),
  status: 'disabled',
});

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

  const client = new Redis(redisUrl, options);

  // Throttle repeated noisy errors (do not auto-disable Redis)
  let lastLog = { code: null, ts: 0 };

  client.on('error', (err) => {
    const msg = (err && err.message) ? err.message : String(err);
    const code = err && (err.code || err.name) ? (err.code || err.name) : 'UNKNOWN';

    const now = Date.now();
    // Log the first occurrence and then at most once every 10s per error type
    if (!lastLog.code || lastLog.code !== code || now - lastLog.ts > 10_000) {
      if (err && err.errors && err.errors.length) {
        console.error('Redis error (Aggregate):', err.errors[0]?.message || msg);
      } else {
        console.error('Redis error:', msg);
      }
      lastLog = { code, ts: now };
    }

    // Intentionally do not disable Redis on connection errors.
    // ioredis will keep retrying based on retryStrategy/maxRetriesPerRequest.
  });

  client.on('connect', () => {
    console.log('Redis connected');
  });

  redis = client;
} else {
  redis = makeStub();
}

module.exports = redis;
