const userService = require("../services/userService");
const jwt = require("jsonwebtoken");
const { newAccessToken } = require("../auth/token");
const { getToken } = require("../config/redis");
const axios = require("axios");

async function authenticate(req, res, next) {
  const username = req.body.username;
  const user = await userService.findByUsername(username);

  const { accessToken, refreshToken } = await getToken(user._id);
  const cookieAccessToken = req.cookies.access_token;

  try {
    if (cookieAccessToken) {
      jwt.verify(cookieAccessToken, process.env.JWT_KEY);
      console.log("Access token from cookie is valid, proceed");
      return next();
    }

    const decodedAccessToken = jwt.verify(accessToken, process.env.JWT_KEY);

    // If access token is valid, proceed
    if (decodedAccessToken) {
      return next();
    }

    // If access token verification fails
    throw new Error("Access token verification failed");
  } catch (err) {
    console.error("Error verifying token:", err.message);

    if (err.name === "TokenExpiredError") {
      try {
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
        // Refresh token is valid, create new access token
        newAccessToken(user._id);
        return next();
      } catch (refreshErr) {
        if (refreshErr.name === "TokenExpiredError") {
          // Refresh token has also expired, redirect to login
          try {
            await axios.post("http://localhost:3000/user/login", {
              username: req.body.username,
              password: req.body.password,
            });
            console.log("Redirecting to login...");
            return next();
          } catch (loginError) {
            console.error("Error redirecting to login:", loginError);
            return res
              .status(500)
              .json({ error: "Error redirecting to login" });
          }
        }
      }
    }

    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = { authenticate };
