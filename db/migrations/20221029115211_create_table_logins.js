exports.up = function (knex) {
  return knex.schema.createTable("logins", function (table) {
    table.engine("Innodb");
    table.charset("UTF8");

    table.increments("id").primary();

    table.string("name", 100).unique().notNull();
    table.string("url").notNull();

    table.string("username").notNull();
    table.string("password").notNull();

    table.timestamps(); // created_at / updated_at
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("logins");
};
