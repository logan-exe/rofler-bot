var express = require("express");
var router = express.Router();

const nftController = require("../controllers/Nft");

router.post("/create_nft", nftController.createNFT);

module.exports = router;
