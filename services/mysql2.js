// get the client
const mysql = require("mysql2");
const knexfile = require("../db/knexfile.js");
const bluebird = require("bluebird");

// create the connection to database
const connection = mysql.createConnection({
  ...knexfile.development.connection,
  Promise: bluebird,
});
module.exports = connection;
