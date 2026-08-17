const { createClient } = require("redis");

const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    connectTimeout: 10000,
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        return false;
      }
      return 500;
    },
    keepAlive: true
  }
});

redis.on("connect", () => {
  console.log("🔄 Connecting to Redis...");
});

redis.on("ready", () => {
  console.log("✅ Redis Ready");
});

redis.on("reconnecting", () => {
  console.log("♻️ Reconnecting to Redis...");
});

redis.on("error", (err) => {
  console.error("Redis Error:", err.message);
});

(async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.error("Redis Initial Connection Failed:", err.message);
  }
})();

module.exports = redis;