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

const endpointUrl = "https://api.twitter.com/2/tweets/search/recent";

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
  var MM = today.getMinutes();
  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;
  if (HH < 10) HH = "0" + HH;
  if (MM < 10) MM = "0" + MM;

  return (today = yyyy + "" + mm + "" + dd + "" + HH + "" + MM);
}

app.post("/search_recent_tweet", async (req, res) => {
  const retweetapi = function (tweetMsg) {
    if (tweetMsg) {
      console.log("Retweeting tweet with id " + tweetMsg.id);
      T.post("statuses/retweet/:id", { id: tweetMsg.id_str }, retweetResult);
    }
  };
  const retweetResult = function (err, data, response) {
    if (err) {
      console.log("Error message for retweet " + err.message);
    } else {
      console.log("Retweet json id" + data.id);
    }
  };

  //Code for search tweets
  function searchTweet() {
    var since = getFormattedDate();
    var params = {
      q: "#100DaysOfCode since:" + since,
      count: 20,
      result_type: "recent",
    };

    T.get("search/tweets", params).then((data) => {
      var tweetMsgs = data.statuses;

      for (let i = 1; i <= tweetMsgs.length; i++) {
        setTimeout(retweetapi, 1000 * 20 * i, tweetMsgs[i]);
      }
    });

    // function tweetResult(err, data, response) {
    //   var tweetMsgs = data.statuses;

    //   for (let i = 1; i <= tweetMsgs.length; i++) {
    //     setTimeout(retweetapi, 1000 * 20 * i, tweetMsgs[i]);
    //   }
    // }
  }

  searchTweet();
  // setInterval(searchTweet, 1000 * 60 * 15);
});

const rwClient = twitterClient.readWrite;

// Tell typescript it's a readonly app
const readOnlyClient = twitterClient.readOnly;
app.post("/status", async (req, res) => {
  //   sdf;

  try {
    await rwClient.v2.tweet("Testing twitter API");
  } catch (e) {
    console.log(e);
  }
  res.status(200).json({
    message: "Success",
  });
});

app.post("/retweet", async (req, res) => {
  await rwClient.v2
    .retweet("1590745443012591616", "1555516444275642369")
    .then((data) => {
      res.send(data);
    });
});

app.get("/sample", async (req, res) => {
  console.log("inside sample");
  const params = {
    query: "#mintWithRofler -is:retweet",
    "tweet.fields": "author_id,created_at,attachments",
  };

  const response = await needle("get", endpointUrl, params, {
    headers: {
      "User-Agent": "v2RecentSearchJS",
      authorization: `Bearer ${token}`,
    },
  });
  // console.log(response.body);
  if (response.body) {
    res.send({ message: "success", data: response.body.data });
  } else {
    throw new Error("Unsuccessful request");
  }
});

app.get("/search", async (req, res) => {
  var since = getFormattedDate();
  var params = {
    q: "#100DaysOfCode since:" + since,
    count: 20,
    result_type: "recent",
  };
  const jsTweets = await rwClient.v2.search("100DaysOfCode", {
    "media.fields": "url",
  });

  console.log(jsTweets);
  // const homeTimeline = await rwClient.v2.homeTimeline({ exclude: "replies" });

  // console.log(homeTimeline.);

  // Consume every possible tweet of jsTweets (until rate limit is hit)
  // for await (const tweet of jsTweets) {
  //   console.log(tweet);
  // }

  res.send("success");
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "HELLO WORLD 123",
  });
});

function getFormattedDate() {
  var today = new Date();

  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  var HH = today.getHours();
  var MM = today.getMinutes();
  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;
  if (HH < 10) HH = "0" + HH;
  if (MM < 10) MM = "0" + MM;

  return (today = yyyy + "" + mm + "" + dd + "" + HH + "" + MM);
}

app.get("/searchssdff", async (req, res) => {
  console.log("inside here!");
  const retweetapi = function (tweetMsg) {
    if (tweetMsg) {
      console.log("Retweeting tweet with id " + tweetMsg.id);
      T.post("statuses/retweet/:id", { id: tweetMsg.id_str }, retweetResult);
    }
  };
  const retweetResult = function (err, data, response) {
    if (err) {
      console.log("Error message for retweet " + err.message);
    } else {
      console.log("Retweet json id" + data.id);
    }
  };
  function searchTweet() {
    var since = getFormattedDate();
    var params = {
      q: "#100DaysOfCode since:" + since,
      count: 20,
      result_type: "recent",
    };

    T.get("/2/users/:id/retweets", params).then((data) => {
      console.log(data);
      res.send(data);
    });

    // async function tweetResult(err, data, response) {
    //   var tweetMsgs = data.statuses;

    //   console.log(tweetMsgs, "this is it");

    //   for (let i = 1; i <= tweetMsgs.length; i++) {
    //     setTimeout(retweetapi, 1000 * 20 * i, tweetMsgs[i]);
    //   }
    //   res.send("success!");
    // }
  }

  searchTweet();
});

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
