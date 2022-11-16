const dotenv = require("dotenv");
dotenv.config();
const multer = require("multer");
const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET_KEY;
var Twit = require("twit");
var { TwitterApi } = require("twitter-api-v2");
const { ethers } = require("ethers");
var cron = require("node-cron");

const Web3 = require("web3");
const fs = require("fs");
const ciqlJson = require("ciql-json");
// const Nft = require("../models/Nft");
// const User = require("../models/User");
// const Activity = require("../models/Activity");
const FormData = require("form-data");
const path = require("path");
const axios = require("axios");
const mongoose = require("mongoose");
const token = process.env.BEARER_TOKEN;
const needle = require("needle");

const { contractAbi, contractAddress } = require("../utils/config");

const web3 = new Web3(
  process.env.RPC_NODE || "https://liberty20.shardeum.org/"
);

const provider = new ethers.providers.JsonRpcProvider({
  url: "https://liberty20.shardeum.org/",
});

const HttpError = require("../models/http-error");
const { exec } = require("child_process");
const { log } = require("console");

const twitterClient = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
});

const rwClient = twitterClient.readWrite;

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

  console.log(
    yyyy + "-" + mm + "-" + dd + "T" + HH + ":" + MM + ":" + SS + "Z"
  );

  return yyyy + "-" + mm + "-" + dd + "T" + HH + ":" + MM + ":" + SS + "Z";
}

/////////////////////////////////// FILE UPLOADER //////////////////////////////////

const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 },
}).single("myImage");

exports.uploadImage = async (req, res, err) => {
  let myPath;
  try {
    upload(req, res, (err) => {
      console.log("Request file ---", req.file);
      myPath = `./public/uploads/${req.file.filename}`;

      res.status(201).json(myPath);
    });
  } catch (err) {
    const error = new HttpError("Upload Rejected", 500);
    return next(error);
  }
};
/////////////////////////////////// FILE UPLOADER //////////////////////////////////

/*
TO PIN FILE TO IPFS AND GET FILE HASH
*/

const pinFileToIPFS = async (myFilePath) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  let data = new FormData();
  data.append("file", fs.createReadStream(myFilePath));
  const res = await axios.post(url, data, {
    maxContentLength: "Infinity",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataSecretApiKey,
    },
  });

  return res.data.IpfsHash;
};

/*
TO PIN METADATA TO IPFS  AND GET FILE HASH
*/

const pinDataToIPFS = async () => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  let data = new FormData();
  data.append("file", fs.createReadStream("./data.json"));
  const res = await axios.post(url, data, {
    maxContentLength: "Infinity",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataSecretApiKey,
    },
  });

  return res.data.IpfsHash;
};

exports.createMetaData = async (req, res, next) => {
  const imagePath = req.body.imagePath;
  const imageHash = await pinFileToIPFS(imagePath);

  ciqlJson
    .open("./data.json")
    .set("image", `https://ipfs.io/ipfs/${imageHash}`)
    .set("name", req.body.name)
    .set("by", req.body.creator)
    .set("description", req.body.description)
    .set("hash", imageHash)
    .set("cover", req.body.cover)
    .set("type", req.body.type)
    .save();

  const metaDataHash = await pinDataToIPFS();

  const metaDataURI = `https://ipfs.io/ipfs/${metaDataHash}`;

  fs.unlink(imagePath, (err) => {
    if (err) {
      console.log(err, "error");
      return;
    }
  });

  res.status(201).json({
    metaDataURI: metaDataURI,
    imageHash: imageHash,
  });
};

exports.createNFT = async (req, res) => {
  retweetBot();

  //   console.log(response.body);
  //   if (respo.body) {
  //     res.send({ message: "success", data: response.body.data });
  //   } else {
  //     throw new Error("Unsuccessful request");
  //   }
};

async function retweetBot() {
  const date = new Date();

  date.setMinutes(date.getMinutes() - 4);

  //RFC 3339 format
  const formatted = date.toISOString();

  console.log(formatted, "this is date");
  console.log("inside sample");
  const searchTweetUrl = "https://api.twitter.com/2/tweets/search/recent";
  const tweetDataUrl = "https://api.twitter.com/2/tweets";
  const currentTime = getFormattedDate();
  console.log(currentTime);

  // res.send("success");

  const params = {
    query: "#mintWithRofler -is:retweet -is:reply",
    "tweet.fields": "author_id,created_at,attachments",
    start_time: formatted,
    expansions: "attachments.media_keys",
    "media.fields": "preview_image_url,public_metrics,type,url,width",
    max_results: 50,
  };

  const response = await needle("get", searchTweetUrl, params, {
    headers: {
      "User-Agent": "v2RecentSearchJS",
      authorization: `Bearer ${token}`,
    },
  });

  // console.log(response.body);

  console.log(response.body, "this is response!");

  if (response.body.meta.result_count == 0) {
    return;
  }
  const tweetList = response.body.data;

  tweetList.forEach(async (data) => {
    //   await rwClient.v2.retweet("1590745443012591616", data.id);
    try {
      const tweetParams = {
        ids: data.id,
        "tweet.fields": "author_id,created_at,attachments",
        expansions: "attachments.media_keys",
        "media.fields": "preview_image_url,public_metrics,type,url,width",
      };

      const eachTweetData = await needle("get", tweetDataUrl, tweetParams, {
        headers: {
          "User-Agent": "v2RecentSearchJS",
          authorization: `Bearer ${token}`,
        },
      });

      console.log(eachTweetData.body, "this is each tweet data");

      if (eachTweetData.body.includes === undefined) {
        return;
      }

      const imageUrl = eachTweetData.body.includes.media[0].url;

      console.log(imageUrl, "image url");

      let arr = eachTweetData.body.data[0].text.split("\n");
      console.log(arr, "test Array");

      let walletAddress = arr[0].split(":")[1];
      let start;

      for (let i = 0; i < walletAddress.length; i++) {
        if (walletAddress[i] === "0") {
          start = i;
          break;
        }
      }

      walletAddress = walletAddress.substring(start, 43);

      let nftName = arr[2].substring(5, arr[2].length);
      let nftDescription = arr[4].substring(12, arr[4].length);
      //   const walletAddress = testArray[0].substring(0, 43);

      const imageNameArray = imageUrl.split("/");
      const imageName = imageNameArray[imageNameArray.length - 1];

      const imagePath = path.resolve(__dirname, "../public/uploads", imageName);

      const writer = fs.createWriteStream(imagePath);

      const response = await axios({
        url: imageUrl,
        method: "GET",
        responseType: "stream",
      });

      console.log(response.data, "this is response");

      response.data.pipe(writer);

      const d = new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      //pushToIPFSusing PINATA

      //createMetadata
      const imageHash = await pinFileToIPFS(`./public/uploads/${imageName}`);

      console.log("this is imageHash", imageHash);

      ciqlJson
        .open("./data.json")
        .set("image", `https://ipfs.io/ipfs/${imageHash}`)
        .set("name", nftName)
        .set("by", walletAddress)
        .set("description", nftDescription)
        .set("hash", imageHash)
        .set("twitter_id", data.id)
        .set("date", formatted)
        .save();

      const metaDataHash = await pinDataToIPFS();

      const metaDataURI = `https://ipfs.io/ipfs/${metaDataHash}`;

      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log(err, "error");
          return;
        }
      });

      //mintNFT
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        provider
      );

      let privateKey = process.env.PRIVATE_KEY;
      let wallet = new ethers.Wallet(privateKey, provider);

      let contractWithSigner = contract.connect(wallet);

      // Set a new Value, which returns the transaction
      let tx = await contractWithSigner.safeMint(walletAddress, metaDataURI);

      // See: https://ropsten.etherscan.io/tx/0xaf0068dcf728afa5accd02172867627da4e6f946dfb8174a7be31f01b11d5364
      console.log(tx.hash, "this is thash");
      // "0xaf0068dcf728afa5accd02172867627da4e6f946dfb8174a7be31f01b11d5364"

      // The operation is NOT complete yet; we must wait until it is mined
      await tx.wait();

      //reply tweet

      const replyTweet = await rwClient.v2.reply(
        `We have minted your #nft on @shardeum ! IPFS: ${metaDataURI} tx: https://explorer-liberty20.shardeum.org/transaction/${tx.hash} `,
        data.id
      );

      console.log("replied to tweet!");
    } catch (e) {
      console.log("some errror occurred!", e);
    }
  });
}

var task = cron.schedule("*/4 * * * *", () => {
  retweetBot();
  console.log("running a task every 4 minutes");
});

//execution start here!
try {
  task.start();
} catch (e) {
  console.log("some error in cron job", e);
}
