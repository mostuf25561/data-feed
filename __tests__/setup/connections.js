const knex = require("../../services/knex.js");
const { Model } = require("objection");

module.exports = {
  connect: async () => {
    Model.knex(knex);
  },

  disconnect: async () => {
    await knex.destroy();
  },
};
