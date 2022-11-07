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

    //
    table.string("scope_notation");

    table.string("scope_from");
    table.string("scope_to");

    //convert the string value before using it
    table.string("scope_type");
    table.enum("object", ["string", "number", "date", "boolean"]);
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
