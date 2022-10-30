exports.up = function (knex) {
  return knex.schema.createTable("credentials", function (table) {
    table.engine("Innodb");
    table.charset("UTF8");

    table.increments("id").primary();

    table.string("name", 100).unique().notNull();
    table.string("url").notNull();

    table.string("username");
    table.string("password");
    table.string("token");

    table.timestamps(true, true); // created_at / updated_at
    table.unique(["username", "password", "token"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("credentials");
};
