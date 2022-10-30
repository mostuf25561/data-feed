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

    table.string("notation"); //field notation
    table.string("field_name").notNull(); //alias, new field name

    table
      .enum("operator", ["lower_then", "greater_then", "contains"])
      .defaultTo("contains")
      .notNull();
    table.enum("connection", ["or", "and"]).notNull().defaultTo("and");

    table.string("value").notNull();
    table.string("new_value").notNull();

    //TODO: add support for value type
    // table.string("value_type").notNull();
    // table.string("new_value_type").notNull();

    table.timestamps(); //created_at, modified_at
    table.datetime("scope");

    table.unique(["notation", "value", "operator"]);
  });
};

exports.down = function (knex /*, Promise*/) {
  return knex.schema.dropTableIfExists("rules");
};
// name: "rule1",
// field_name: "field_name1",
// operator: "lower_then",
// connection: "connection1",
// value: "value1",
// new_value: "new_value1",
// updated_at: "2021-10-29 11:52:50",
// created_at: "2021-10-29 11:52:50",
// scope: "2021-10-29 11:52:50",
