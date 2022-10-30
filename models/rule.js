const { Model } = require("objection");

class Rule extends Model {
  static get tableName() {
    return "rules";
  }

  static get relationMappings() {
    const Feed = require("./feed");
    return {
      feed: {
        relation: Model.BelongsToOneRelation,
        modelClass: Feed,
        join: {
          from: "rule.feedId",
          to: "feed.id",
        },
      },
    };
  }
}

module.exports = Rule;