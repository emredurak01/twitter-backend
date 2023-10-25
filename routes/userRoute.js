const express = require("express");
const router = express.Router();
const userService = require("../services/userService");
const jwt = require("jsonwebtoken");
const { authenticate } = require("../auth/authenticate");

require("dotenv").config();

router.post("/register", async (req, res) => {
  const { username, email, age, password } = req.body;

  try {
    if (!username || !email || !age || !password) {
      return res
        .status(400)
        .json({ error: "Missing required fields for user" });
    }

    if (await userService.model.findOne({ $or: [{ username }, { email }] })) {
      return res.status(403).json({ error: "User already exists" });
    }

    const user = await userService.register(username, email, age, password);
    res.status(201).json(user);
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Error registering user" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Missing required fields for tweet" });
    }

    const accessToken = await userService.login(username, password);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 60000,
    });

    res.status(201).json("Logged in successfully");
  } catch (err) {
    console.error("Error logging in", err);
    res.status(500).json({ error: "Error logging in" });
  }
});

router.post("/newtweet", authenticate, async (req, res) => {
  const { username, desc } = req.body;

  try {
    if (!username || !desc) {
      return res
        .status(400)
        .json({ error: "Missing required fields for tweet" });
    }

    const tweet = await userService.newTweet(username, desc);
    res.status(201).json(tweet);
  } catch (err) {
    console.error("Error creating tweet", err);
    res.status(500).json({ error: "Error creating tweet" });
  }
});

router.post("/follow", async (req, res) => {
  const { follower, followee } = req.body;

  try {
    if (!follower || !followee) {
      return res
        .status(400)
        .json({ error: "Missing required fields for follow" });
    }

    await userService.follow(follower, followee);

    res.status(201).json(`${follower} is now following ${followee}`);
  } catch (err) {
    console.error("Error following", err);
    res.status(500).json({ error: "Error following" });
  }
});

router.post("/retweet", async (req, res) => {
  const { username, desc, tweet } = req.body;

  try {
    if (!username || !tweet || !desc) {
      return res
        .status(400)
        .json({ error: "Missing required fields for tweet" });
    }

    await userService.retweet(username, desc, tweet);
    res.status(201).json({ message: "Retweet created successfully" });
  } catch (err) {
    console.error("Error retweeting:", err);
    res.status(500).json({ error: "Error retweeting" });
  }
});

router.post("/like", async (req, res) => {
  const { username, tweet } = req.body;

  try {
    if (!username || !tweet) {
      return res
        .status(400)
        .json({ error: "Missing required fields for like" });
    }

    await userService.like(username, tweet);
    res.status(201).json({ message: "Tweet liked successfully" });
  } catch (err) {
    console.error("Error liking tweet:", err);
    res.status(500).json({ error: "Error liking tweet" });
  }
});

module.exports = router;
