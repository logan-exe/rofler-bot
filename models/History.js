const mongoose = require("mongoose");
const shortid = require("shortid");

const History = mongoose.model(
  "history",
  new mongoose.Schema({
    _id: { type: String, default: shortid.generate },
    token_id: String,
    from_address: String,
    to_address: String,
    date: String,
    tx_hash: String,
  })
);

module.exports = History;
