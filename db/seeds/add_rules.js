exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("rules")
    .del()
    .then(async function () {
      // Inserts seed entries
      return knex("rules").insert([
        {
          name: "rule1",
          field_name: "field_name1",
          operator: "lower_then",
          connection: "or",
          value: "value1",
          new_value: "new_value1",
          updated_at: "2021-10-29 11:52:50",
          created_at: "2021-10-29 11:52:50",
          scope: "2021-10-29 11:52:50",
          feed_id: 1,
        },
        {
          name: "rule2",
          field_name: "field_name2",
          operator: "lower_then",
          connection: "or",
          value: "value2",
          new_value: "new_value2",
          updated_at: "2021-10-29 11:52:50",
          created_at: "2021-10-29 11:52:50",
          scope: "2021-10-29 11:52:50",
          feed_id: 2,
        },
      ]);
    });
};
