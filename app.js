const express = require("express");
const rulesRouter = require("./routes/rules");

const app = express();

app.use(express.json());
app.use("/api/rules", rulesRouter);

app.use(errorHandler);

function errorHandler(err, req, res, next) {
  res.status(500);
  res.json({ error: err.message, stack: err.stack });
}

app.get("/", async (req, res, next) => {
  const now = Date.now();
  res.send("time:  " + now);
});

module.exports = app;
