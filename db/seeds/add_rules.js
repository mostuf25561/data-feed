exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("rules")
    .del()
    .then(async function () {
      // Inserts seed entries
      return knex("rules").insert([
        {
          object_notation: "age",
          equality: "lower_than",
          value: 2,
          new_value: "needs help",
          boolean_combination: "or",
          column_name_alias: "as_age",
          type: "int",
          feed_id: 1,
        },
        {
          object_notation: "age",
          equality: "greater_than",
          value: 100,
          new_value: "needs help",
          boolean_combination: "or",
          column_name_alias: "as_age",
          type: "int",
          feed_id: 1,
        },
        {
          object_notation: "age",
          equality: "lower_than",
          value: 100,
          new_value: "doing well",
          boolean_combination: "or",
          column_name_alias: "as_age",
          type: "int",
          feed_id: 1,
        },
        {
          object_notation: "name",
          equality: "contains",
          value: "b",
          new_value: "has b or c",
          boolean_combination: "or",
          column_name_alias: "as_name",

          type: "VARCHAR(100)",
          feed_id: 1,
        },
        {
          object_notation: "name",
          equality: "contains",
          value: "c",
          new_value: "has b or c",
          boolean_combination: "or",
          column_name_alias: "as_name",

          type: "VARCHAR(100)",
          feed_id: 1,
        },
        {
          column_name_alias: "column_name_alias1",
          equality: "lower_than",
          boolean_combination: "or",
          value: "value1",
          new_value: "new_value1",

          feed_id: 3,
        },
        {
          column_name_alias: "column_name_alias2",
          equality: "lower_than",
          boolean_combination: "or",
          value: "value2",
          new_value: "new_value2",

          feed_id: 3,
        },
      ]);
    });
};
