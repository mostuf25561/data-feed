const { Model } = require("objection");

class Login extends Model {
  static get tableName() {
    return "logins";
  }
}

module.exports = Login;
