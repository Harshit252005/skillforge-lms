const { createClient } = require('redis');

// Redis is only a cache. If it is missing or down, the app must keep working
// by reading from MongoDB, so every method here "fails open" instead of
// throwing or hanging.

const REDIS_URL = process.env.REDIS_URL;
const COMMAND_TIMEOUT_MS = 1500;

let client = null;
let lastErrorLog = 0;

if (!REDIS_URL) {
    console.log('REDIS_URL not set - running without cache (courses are read from MongoDB).');
} else {
    client = createClient({
        url: REDIS_URL,
        // Reject commands immediately while disconnected instead of queueing them
        // (a queued command would make the request hang until Redis comes back).
        disableOfflineQueue: true,
        socket: {
            connectTimeout: 5000,
            // Keep retrying in the background, slowly, so it recovers by itself.
            reconnectStrategy: (retries) => Math.min(retries * 500, 10000),
        },
    });

    // Log at most one Redis error per minute instead of flooding the logs.
    client.on('error', (err) => {
        const now = Date.now();
        if (now - lastErrorLog > 60000) {
            lastErrorLog = now;
            console.warn('Redis unavailable, serving without cache:', err.code || err.message);
        }
    });

    client.on('ready', () => console.log('Connected to Redis Cache'));

    client.connect().catch(() => { /* handled by the error listener above */ });
}

function withTimeout(promise, ms) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Redis command timed out')), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function safe(command, args, fallback) {
    if (!client || !client.isReady) return fallback;
    try {
        return await withTimeout(client[command](...args), COMMAND_TIMEOUT_MS);
    } catch (err) {
        console.warn(`Redis ${command} failed, continuing without cache:`, err.message);
        return fallback;
    }
}

// Same method names the routes already use, so no other file needs to change.
module.exports = {
    get: (key) => safe('get', [key], null),
    setEx: (key, seconds, value) => safe('setEx', [key, seconds, value], null),
    del: (key) => safe('del', [key], 0),
    isReady: () => Boolean(client && client.isReady),
};