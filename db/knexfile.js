// Update with your config settings.

module.exports = {
  development: {
    client: "mysql",
    connection: {
      database: "feed_data",
      user: "root",
      password: "my-secret-pw",
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
