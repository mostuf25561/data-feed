const { Model } = require("objection");

class Feed extends Model {
  static get tableName() {
    return "feeds";
  }

  static get relationMappings() {
    const Rule = require("./rule");
    return {
      rules: {
        relation: Model.HasManyRelation,
        modelClass: Rule,
        join: {
          from: "feeds.id",
          to: "rules.feed_id",
        },
      },
    };
  }
}

module.exports = Feed;
