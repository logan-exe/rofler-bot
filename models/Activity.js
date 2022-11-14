const mongoose = require("mongoose");
const shortid = require("shortid");

const Activity = mongoose.model(
  "activity",
  new mongoose.Schema({
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    tx_type: String,
    date: String,
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: String,
    token_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nft",
    },
    contract_address: String,
    tx_hash: String,
  })
);

module.exports = Activity;
