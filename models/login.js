const { Model } = require("objection");

class Login extends Model {
  static get tableName() {
    return "login";
  }
}

module.exports = Login;
