const { Model } = require("objection");

class credential extends Model {
  static get tableName() {
    return "credentials";
  }
}

module.exports = credential;
