const { Model } = require("objection");

class Feed extends Model {
  static get tableName() {
    return "feed";
  }

  static get relationMappings() {
    const Rule = require("./rule");
    return {
      rules: {
        relation: Model.HasManyRelation,
        modelClass: Rule,
        join: {
          from: "feed.id",
          to: "rule.feedId",
        },
      },
    };
  }
}

module.exports = Feed;
