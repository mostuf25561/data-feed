const knexfile = require("../db/knexfile.js");

const Knex = require("knex");

const knex = Knex(knexfile.development);

module.exports = knex;
