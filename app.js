const express = require("express");
const bodyParser = require("body-parser");
const userRoute = require("./routes/userRoute");
const tweetRoute = require("./routes/tweetRoute");
const likeRoute = require("./routes/likeRoute");
const connectToMongo = require("./config/mongodb");
const { connectToRedis } = require("./config/redis");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config();

const app = express();
const PORT = process.env.EXPRESS_PORT;

app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());

app.use("/user", userRoute);
app.use("/tweet", tweetRoute);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

connectToMongo();
connectToRedis();
