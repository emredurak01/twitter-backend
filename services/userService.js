const Database = require("../database");
const UserModel = require("../models/userModel");
const TweetModel = require("../models/tweetModel");
const LikeModel = require("../models/likeModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { redisClient } = require("../config/redis");
const { newAccessToken, newRefreshToken } = require("../auth/token");

class UserService extends Database {
  constructor() {
    super(UserModel);
  }

  async register(username, email, age, password) {
    try {
      let user;

      bcrypt.hash(password, 10, async function (err, password) {
        user = await UserModel.create({ username, email, age, password });
        redisClient.set(user._id.toString(), ":");
      });

      console.log(`${username} registered.`);
      return user;
    } catch (err) {
      console.error("Error saving user:", err);
    }
  }

  async login(username, password) {
    const user = await this.findByUsername(username);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.error("Invalid username or password");
      return;
    }

    const accessToken = await newAccessToken(user._id);
    const refreshToken = await newRefreshToken(user._id);

    console.log("Login successful");
    return accessToken;
  }

  async findByUsername(username) {
    try {
      const user = await UserModel.findOne({ username }).populate();
      return user;
    } catch (err) {
      console.error("Error finding user:", err);
    }
  }

  async newTweet(username, tweetDesc) {
    try {
      const user = await this.findByUsername(username);

      if (!user) {
        throw new Error("User not found");
      }

      const tweet = new TweetModel({
        user: user._id,
        desc: tweetDesc,
      });

      const savedTweet = await tweet.save();
      user.tweets.push(savedTweet._id);
      await user.save();

      console.log(`${user.username} tweeted: "${savedTweet.desc}"`);
      return savedTweet;
    } catch (err) {
      console.error("Error creating new tweet:", err);
    }
  }

  async follow(followerUsername, followeeUsername) {
    try {
      const follower = await this.findByUsername(followerUsername);
      const followee = await this.findByUsername(followeeUsername);

      if (!follower) {
        console.log(`${followerUsername} not found`);
      }
      if (!followee) {
        console.log(`${followeeUsername} not found`);
      }

      if (
        follower.following.some((followedUser) =>
          followedUser._id.equals(followee._id)
        )
      ) {
        console.log(
          `${follower.username} is already following ${followee.username}`
        );
        return;
      }

      follower.following.push(followee._id);
      await follower.save();

      followee.followers.push(follower._id);
      await followee.save();

      console.log(`${follower.username} is now following ${followee.username}`);
    } catch (err) {
      console.error("Error following user:", err);
    }
  }

  async retweet(username, desc, tweet) {
    try {
      const user = await this.findByUsername(username);

      const originalTweet = await TweetModel.findById(tweet);

      if (!originalTweet) {
        console.log("Original tweet not found.");
        return;
      }

      const retweet = new TweetModel({
        user: user._id,
        desc: desc,
        retweet: originalTweet,
      });

      const savedTweet = await retweet.save();
      user.retweets.push(savedTweet._id);

      console.log(
        `${user.username} retweeted: "${retweet.desc}" -> "${originalTweet.desc}"`
      );
      await user.save();
    } catch (err) {
      console.error("Error creating retweet:", err);
    }
  }

  async like(username, tweet) {
    try {
      const user = await this.findByUsername(username);

      const tweetToLike = await TweetModel.findById(tweet);

      if (!tweetToLike) {
        console.log("Tweet not found.");
        return;
      }

      const existingLike = await LikeModel.findOne({
        user: user._id,
        tweet: tweetToLike._id,
      });

      if (existingLike) {
        console.log(`${user.username} has already liked this tweet.`);
        return;
      }

      const like = new LikeModel({
        user: user._id,
        tweet: tweetToLike._id,
      });

      const savedLike = await like.save();

      tweetToLike.likes.push(savedLike._id);
      await tweetToLike.save();

      user.likedTweets.push(tweetToLike._id);
      await user.save();

      console.log(`${user.username} liked tweet: "${tweetToLike.desc}"`);
    } catch (err) {
      console.error("Error liking tweet:", err);
    }
  }
}

module.exports = new UserService();
