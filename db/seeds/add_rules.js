exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("rules")
    .del()
    .then(async function () {
      // Inserts seed entries
      return knex("rules").insert([
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
          feed_id: 1,
        },
        {
          name: "rule2",
          column_name_alias: "column_name_alias2",
          equality: "lower_then",
          boolean_combination: "or",
          value: "value2",
          new_value: "new_value2",

          scope: "2021-10-29 11:52:50",
          feed_id: 2,
        },
      ]);
    });
};
