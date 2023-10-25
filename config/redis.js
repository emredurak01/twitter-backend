const redis = require("redis");

const redisClient = redis.createClient({
  host: "localhost",
  port: process.env.REDIS_PORT,
});

async function connectToRedis() {
  redisClient.on("error", (err) => console.log("Redis Client Error", err));

  redisClient.connect();
}

async function getToken(userId) {
  const userIdString = userId.toString();

  const redisToken = await redisClient.get(userIdString);
  const [accessToken, refreshToken] = redisToken.split(":");

  return { accessToken, refreshToken };
}

async function saveToken(userId, accessToken, refreshToken) {
  const userIdString = userId.toString();
  const accessTokenString = accessToken.toString();
  const refreshTokenString = refreshToken.toString();

  const redisToken = accessTokenString + ":" + refreshTokenString;
  await redisClient.set(userIdString, redisToken);
}

async function saveAccessToken(userId, accessToken) {
  const userIdString = userId.toString();
  const accessTokenString = accessToken.toString();

  const fullToken = await redisClient.get(userIdString);
  const parts = fullToken.split(":");
  const newToken = accessTokenString + ":" + parts[1];

  await redisClient.set(userIdString, newToken);
}

async function saveRefreshToken(userId, refreshToken) {
  const userIdString = userId.toString();
  const refreshTokenString = refreshToken.toString();

  const fullToken = await redisClient.get(userIdString);
  const parts = fullToken.split(":");
  const newToken = parts[0] + ":" + refreshTokenString;

  await redisClient.set(userIdString, newToken);
}

module.exports = {
  redisClient,
  connectToRedis,
  getToken,
  saveToken,
  saveAccessToken,
  saveRefreshToken,
};
