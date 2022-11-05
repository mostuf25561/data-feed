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
          equality: "bigger_than",
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
          scope: "2011-10-06T14:48:00.000Z",
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
          scope: "2012-10-06T14:48:00.000Z",
          type: "VARCHAR(100)",
          feed_id: 1,
        },
        {
          name: "rule1",
          column_name_alias: "column_name_alias1",
          equality: "lower_then",
          boolean_combination: "or",
          value: "value1",
          new_value: "new_value1",
          updated_at: "2021-10-29 11:52:50",
          created_at: "2021-10-29 11:52:50",
          scope: "2021-10-29 11:52:50",
          feed_id: 3,
        },
        {
          name: "rule2",
          column_name_alias: "column_name_alias2",
          equality: "lower_then",
          boolean_combination: "or",
          value: "value2",
          new_value: "new_value2",
          scope: "2021-10-29 11:52:50",
          feed_id: 3,
        },
      ]);
    });
};
