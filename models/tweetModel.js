const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Like",
    },
  ],
  retweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tweet",
  },
});

const TweetModel = mongoose.model("Tweet", tweetSchema);

module.exports = TweetModel;
