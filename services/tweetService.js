const Veritabani = require("../database");
const TweetModel = require("../models/tweetModel");
const { findByUsername } = require("./userService");

class TweetService extends Veritabani {
  constructor() {
    super(TweetModel);
  }

  async deleteTweet(username, tweetId) {
    try {
      const user = await findByUsername(username);

      const tweet = await TweetModel.findById(tweetId);

      if (!tweet) {
        throw new Error("Tweet not found");
      }

      const index = user.tweets.indexOf(tweet._id);
      user.tweets.splice(index, 1);

      await TweetModel.deleteOne({ _id: tweet._id });

      await user.save();
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new TweetService();
