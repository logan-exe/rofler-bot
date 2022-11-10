const dotenv = require("dotenv");
dotenv.config();
var express = require("express");
var cors = require("cors");
const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "HELLO WORLD!",
  });
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
