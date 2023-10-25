const jwt = require("jsonwebtoken");
const { saveAccessToken, saveRefreshToken } = require("../config/redis");

async function newAccessToken(userIdParam) {
  const accessToken = jwt.sign({ userId: userIdParam }, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  saveAccessToken(userIdParam, accessToken);
  return accessToken;
}

async function newRefreshToken(userIdParam) {
  const refreshToken = jwt.sign(
    { userId: userIdParam },
    process.env.JWT_REFRESH_KEY,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE },
  );

  saveRefreshToken(userIdParam, refreshToken);
  return refreshToken;
}

module.exports = { newAccessToken, newRefreshToken };
