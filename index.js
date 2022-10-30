const knex = require("./services/knex");
const { Model } = require("objection");

const app = require("./app");
// set up database with objection and knex
Model.knex(db);

app.listen(process.env.NODE_PORT, () => {
  console.log(`listening on port ${process.env.NODE_PORT}`);
});
