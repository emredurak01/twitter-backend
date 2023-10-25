const express = require("express");
const router = express.Router();
const tweetService = require("../services/tweetService");

router.post("/delete", async (req, res) => {
  const { username, tweet } = req.body;

  try {
    if (!username || !tweet) {
      return res
        .status(400)
        .json({ error: "Missing required fields for tweet" });
    }

    await tweetService.deleteTweet(username, tweet);
    res.status(201).json({ message: "Tweet deleted successfully" });
  } catch (err) {
    console.error("Error deleting tweet:", err);
    res.status(500).json({ error: "Error deleting tweet" });
  }
});

module.exports = router;
