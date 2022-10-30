const express = require("express");

// import validator from "express-validator";
const bodyParser = require("body-parser");

const rulesRouter = require("./routes/rules");
const feedsRouter = require("./routes/feeds");

const credentialsRouter = require("./routes/credentials");

const app = express();

// app.use(validator());
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ limit: "1mb", extended: false }));

app.use(express.json());
app.use("/api/rules", rulesRouter);
app.use("/api/feeds", feedsRouter);
app.use("/api/credentials", credentialsRouter);

app.get("/", async (req, res, next) => {
  const now = Date.now();
  res.send("time:  " + now);
});

app.use(errorHandler);

function errorHandler(err, req, res, next) {
  res.status(500);
  res.json({ error: err.message, stack: err.stack });
}

module.exports = app;
