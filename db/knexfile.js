// Update with your config settings.
const bluebird = require("bluebird");
module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: "localhost",
      database: "feed_data",
      user: "root",
      password: "my-secret-pw",
      port: 3308,
      Promise: bluebird,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "./seeds",
    },
  },
};
