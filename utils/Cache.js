/**
 * A class representing a  cache.
 */
class Cache {
  /**
   * Creates an instance of CashCache.
   * @param {object} [options={}] - The options for cache configuration.
   * @param {number} [options.sizeLimit=Infinity] - The maximum size limit of the cache.
   * @param {number} [options.cleanupInterval=60000] - The interval (in milliseconds) for cache cleanup.
   * @param {number} [options.timeToLive=Infinity] - The default time-to-live (in milliseconds) for cache items.
   */
  constructor(options = {}) {
    // Initialize cache properties
    this.cache = new Map();
    this.sizeLimit = options.sizeLimit || Infinity;
    this.cleanupInterval = options.cleanupInterval || 60 * 1000; // Cleanup every 60 seconds by default
    this.timeToLive = options.timeToLive || Infinity; // Default timeToLive set to Infinity if not provided

    if (this.cleanupInterval > 0) {
      this.startCleanup();
    }
  }

  /**
   * Sets a cache item with a key and value.
   * @param {*} key - The key of the cache item.
   * @param {*} value - The value of the cache item.
   * @param {number} [ttl=this.timeToLive] - The time-to-live (in milliseconds) for the cache item.
   */
  set(key, value, ttl = this.timeToLive) {
    const expirationTime = Date.now() + ttl;
    this.cache.set(key, { value, expirationTime });

    if (this.cache.size > this.sizeLimit) {
      this.removeOldestItem();
    }
  }

  /**
   * Gets the value of a cache item based on the key.
   * @param {*} key - The key of the cache item.
   * @returns {*} The value of the cache item, or undefined if not found or expired.
   */
  get(key) {
    const item = this.cache.get(key);
    if (item && Date.now() < item.expirationTime) {
      return item.value;
    }
    return undefined;
  }

  /**
   * Gets multiple cache items at once based on an array of keys.
   * @param {Array} keys - An array of keys for cache items.
   * @param {Function} [cb] - An optional callback function to invoke with the results.
   * @returns {object} An object containing the cache items with their corresponding keys.
   */
  mget(keys, cb) {
    const result = {};
    keys.forEach((key) => {
      result[key] = this.get(key);
    });

    if (cb && typeof cb === 'function') {
      cb(result);
    }

    return result;
  }

  /**
   * Sets multiple cache items at once based on an array of key-value pairs.
   * @param {Array} keyValueSet - An array of key-value pairs for cache items.
   * @returns {boolean} A boolean indicating whether the operation was successful.
   */
  mset(keyValueSet) {
    keyValueSet.forEach((item) => {
      const { key, value, timeToLive } = item;
      this.set(key, value, timeToLive);
    });

    return true;
  }

  /**
   * Deletes a cache item based on the key.
   * @param {*} key - The key of the cache item to delete.
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clears all cache items.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Gets the size of the cache.
   * @returns {number} The size of the cache.
   */
  getSize() {
    return this.cache.size;
  }

  /**
   * Starts the cleanup process based on the cleanup interval.
   */
  startCleanup() {
    this.cleanupIntervalId = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  /**
   * Removes expired cache items during cleanup.
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    this.cache.forEach((item, key) => {
      if (item.expirationTime <= now) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach((key) => {
      this.cache.delete(key);
    });
  }

  /**
   * Removes the oldest cache item when the cache size exceeds the limit.
   */
  removeOldestItem() {
    let oldestKey;
    let oldestExpirationTime = Infinity;

    this.cache.forEach((item, key) => {
      if (item.expirationTime < oldestExpirationTime) {
        oldestKey = key;
        oldestExpirationTime = item.expirationTime;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Sets a cache item asynchronously and returns a promise.
   * @param {*} key - The key of the cache item.
   * @param {*} value - The value of the cache item.
   * @returns {Promise<void>} A promise that resolves when the cache item is set.
   */
  setAsync(key, value) {
    return new Promise((resolve) => {
      this.set(key, value);
      resolve();
    });
  }

  /**
   * Gets the value of a cache item asynchronously and returns a promise.
   * @param {*} key - The key of the cache item.
   * @returns {Promise<*>} A promise that resolves with the value of the cache item.
   */
  getAsync(key) {
    return new Promise((resolve) => {
      resolve(this.get(key));
    });
  }

  /**
   * Gets multiple cache items asynchronously and returns a promise.
   * @param {Array} keys - An array of keys for cache items.
   * @returns {Promise<object>} A promise that resolves with an object containing the cache items with their corresponding keys.
   */
  mgetAsync(keys) {
    return new Promise((resolve) => {
      resolve(this.mget(keys));
    });
  }

  /**
   * Sets multiple cache items asynchronously and returns a promise.
   * @param {Array} keyValueSet - An array of key-value pairs for cache items.
   * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the operation was successful.
   */
  msetAsync(keyValueSet) {
    return new Promise((resolve) => {
      resolve(this.mset(keyValueSet));
    });
  }

  /**
   * Deletes a cache item asynchronously and returns a promise.
   * @param {*} key - The key of the cache item to delete.
   * @returns {Promise<void>} A promise that resolves when the cache item is deleted.
   */
  deleteAsync(key) {
    return new Promise((resolve) => {
      this.delete(key);
      resolve();
    });
  }

  /**
   * Clears all cache items asynchronously and returns a promise.
   * @returns {Promise<void>} A promise that resolves when all cache items are cleared.
   */
  clearAsync() {
    return new Promise((resolve) => {
      this.clear();
      resolve();
    });
  }

  /**
   * Gets the size of the cache asynchronously and returns a promise.
   * @returns {Promise<number>} A promise that resolves with the size of the cache.
   */
  getSizeAsync() {
    return new Promise((resolve) => {
      resolve(this.getSize());
    });
  }
}

module.exports = Cache;
