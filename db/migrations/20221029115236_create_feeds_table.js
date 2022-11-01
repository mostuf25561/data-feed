"use strict";
//customer_id, id, name, email, password
exports.up = function (knex /*, Promise*/) {
  return knex.schema.createTable("feeds", function (table) {
    table.engine("Innodb");
    table.charset("UTF8");

    table.increments("id").primary();

    table.string("name", 100).unique().notNull();
    table.string("description");

    table.string("url").notNull();

    table.string("root_notation");

    //foreign keys
    table
      .integer("credential_id")
      .unsigned()
      .references("credentials.id")
      .defaultTo(null);

    // Other
    table.timestamps(true, true); // created_at / updated_at
  });
};

exports.down = function (knex /*, Promise*/) {
  return knex.schema.dropTableIfExists("feeds");
};
