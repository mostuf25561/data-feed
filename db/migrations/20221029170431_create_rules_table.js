exports.up = function (knex /*, Promise*/) {
  return knex.schema.createTable("rules", function (table) {
    table.engine("Innodb");
    table.charset("UTF8");

    table.increments("id").unsigned().primary();

    table
      .integer("feed_id")
      .notNull()
      .unsigned()
      .references("feeds.id")
      // .inTable("feeds")
      .onDelete("CASCADE");
    table.string("name", 100).unique().notNull();
    table.string("type", 50).notNull().defaultTo("VARCHAR(100)"); //field object_notation

    table.string("object_notation"); //field object_notation
    table.string("column_name_alias").notNull(); //alias, new field name

    table
      .enum("equality", ["lower_then", "greater_then", "contains"])
      .defaultTo("contains")
      .notNull();
    table.enum("boolean_combination", ["or", "and"]).notNull().defaultTo("and");

    table.string("value").notNull();
    table.string("new_value").notNull();

    table.timestamps(true, true); //created_at, modified_at

    table.datetime("scope");

    table.unique(["object_notation", "value", "equality"]);
  });
};

exports.down = function (knex /*, Promise*/) {
  return knex.schema.dropTableIfExists("rules");
};
