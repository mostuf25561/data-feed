const knex = require("./services/knex");
const { Model } = require("objection");

const app = require("./app");
const port = process.env.NODE_PORT || 8081;
// set up database with objection and knex
Model.knex(knex);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
