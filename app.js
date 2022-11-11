const dotenv = require("dotenv");
dotenv.config();
var express = require("express");
var cors = require("cors");
const app = express();
app.use(cors());
var Twit = require("twit");
var { TwitterApi } = require("twitter-api-v2");
// console.log(TwitterApi);
// import { TwitterApi } from "twitter-api-v2";

const needle = require("needle");

// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const token = process.env.BEARER_TOKEN;

const twitterClient = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
});

var T = new Twit({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
});

function getFormattedDate() {
  var today = new Date();

  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  var HH = today.getHours();
  var MM = today.getMinutes() - 5;
  var SS = today.getSeconds();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  if (HH < 10) {
    HH = "0" + HH;
  }
  if (MM < 10) {
    MM = "0" + MM;
  }

  return yyyy + "-" + mm + "-" + dd + "T" + HH + ":" + MM + ":" + SS + "Z";
}

const rwClient = twitterClient.readWrite;

app.get("/sample", async (req, res) => {
  async function retweetBot() {
    console.log("inside sample");
    const searchTweetUrl = "https://api.twitter.com/2/tweets/search/recent";
    const tweetDataUrl = "https://api.twitter.com/2/tweets";
    const currentTime = getFormattedDate();
    console.log(currentTime);

    // res.send("success");

    const params = {
      query: "#javascript OR #web3 -is:retweet",
      "tweet.fields": "author_id,created_at,attachments",
      start_time: currentTime,
      expansions: "attachments.media_keys",
      "media.fields": "preview_image_url,public_metrics,type,url,width",
      max_results: 10,
    };

    const response = await needle("get", searchTweetUrl, params, {
      headers: {
        "User-Agent": "v2RecentSearchJS",
        authorization: `Bearer ${token}`,
      },
    });

    // console.log(response.body);

    const tweetList = response.body.data;

    if (response.body.meta.result_count == 0) {
      return;
    }

    tweetList.forEach(async (data) => {
      await rwClient.v2.retweet("1590745443012591616", data.id);

      // ********************important code to get media url********************
      // const tweetParams = {
      //   ids: data.id,
      //   "tweet.fields": "author_id,created_at,attachments",
      //   expansions: "attachments.media_keys",
      //   "media.fields": "preview_image_url,public_metrics,type,url,width",
      // };

      // const eachTweetData = await needle("get", tweetDataUrl, tweetParams, {
      //   headers: {
      //     "User-Agent": "v2RecentSearchJS",
      //     authorization: `Bearer ${token}`,
      //   },
      // });
    });
  }

  retweetBot();
  setInterval(() => {
    retweetBot();
  }, 600000 * 2);

  // console.log(response.body);
  // if (response.body) {
  //   res.send({ message: "success", data: response.body.data });
  // } else {
  //   throw new Error("Unsuccessful request");
  // }
});

app.get("/", (req, res) => {});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

// mongoConnect((res) => {
//   console.log("connection successfull!!!");
//   app.listen(process.env.PORT || 5000);
// });

app.listen(process.env.PORT || 5000);
