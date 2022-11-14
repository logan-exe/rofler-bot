const mongoose = require("mongoose");
const shortid = require("shortid");

const userSchema = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  wallet_address: String,
  blockchain: String,
  profile_image: String,
  cover_image: String,
  fullname: String,
  bio: String,
  instagram: String,
  facebook: String,
  twitter: String,
  telegram: String,
  discord: String,
  email: String,
  ip_address: String,
  multiple_transfer: Boolean,
  is_verified: Boolean,
  is_blocked: Boolean,
  phone: String,
  username: String,
  wallet_type: String,
  website: String,
  following: [
    {
      following_info: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  followers: [
    {
      follower_info: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
