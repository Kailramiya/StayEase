const redis = require('./redis');

const normalizeKey = (keyObj) => {
  // Sort keys to make deterministic
  const entries = Object.entries(keyObj).filter(([_, v]) => v !== undefined && v !== null && v !== '');
  entries.sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(entries));
};

exports.getOrSetCache = async (prefix, params, ttlSeconds, fetchFunction) => {
  const key = `${prefix}:${normalizeKey(params)}`;
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    // If Redis fails, continue without cache
    console.warn('Cache get failed, proceeding without cache');
  }

  const fresh = await fetchFunction();

  try {
    await redis.set(key, JSON.stringify(fresh), 'EX', ttlSeconds);
  } catch (e) {
    // Ignore set errors
    console.warn('Cache set failed, continuing');
  }

  return fresh;
};

exports.invalidateByPrefix = async (prefix) => {
  try {
    const stream = redis.scanStream({ match: `${prefix}:*` });
  const keys = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (resultKeys) => {
      for (const k of resultKeys) keys.push(k);
    });
    stream.on('end', async () => {
      if (keys.length) await redis.del(keys);
      resolve(keys.length);
    });
    stream.on('error', reject);
  });
  } catch (e) {
    // Redis disabled or error — nothing invalidated
    return 0;
  }
};
