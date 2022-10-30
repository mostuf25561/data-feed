exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("credentials")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("credentials").insert([
        {
          name: "name1",
          username: "username",
          password: "password1",
          url: "url1",
        },
        {
          name: "name2",
          username: "username2",
          password: "password2",
          url: "url2",
        },
      ]);
    });
};
