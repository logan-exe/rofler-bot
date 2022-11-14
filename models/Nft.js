const mongoose = require("mongoose");
const shortid = require("shortid");

const nftSchema = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  token_id: String,
  tx_hash: String,
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  owned_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  trending: Boolean,
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auction",
  },
  on_auction: Boolean,
  on_sale: Boolean,
  instant_sale: Boolean,
  contract_address: String,
  royalty: Number,
  image_ipfs: String,
  image_url: String,
  fixed_price: String,
  metadata_ipfs: String,
  description: String,
  created_date: String,
  title: String,
  nft_type: String,
  selling_type: String,
  likes: [
    {
      liked_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
});

module.exports = mongoose.model("Nft", nftSchema);
