const { createClient } = require('redis');

// Connect to Redis (uses local redis or an environment URL for production)
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log('Connected to Redis Cache');
    }
}

connectRedis();

module.exports = redisClient;