exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("feeds")
    .del()
    .then(function () {
      // Inserts seed entries

      return knex("feeds").insert([
        {
          name: "name1",
          description: "description1",
          url: "url1",
          root_notation: "data.results",
          login_id: null,
        },
        {
          name: "name2",
          description: "description",
          url: "url1",
          root_notation: "root_notation",
          login_id: null,
        },
      ]);
    });
};
