const jsonToSql = require("../lib/jsonToSql");
const model = require("../models/rule");
const feedModel = require("../models/feed");

module.exports = {
  list: async (req, res, next) => {
    try {
      const { id } = req.params;
      const results = await model.query().select();
      res.send(results);
    } catch (err) {
      next(err);
    }
  },

  get: async (req, res, next) => {
    try {
      const { id } = req.params;
      const results = await model.query().findById(id).throwIfNotFound();
      res.send(results);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await model.query().deleteById(id).throwIfNotFound();
      res.json({ id: parseInt(id) });
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const {
        name,
        column,
        scope,
        equality,
        value,
        column_name_alias,
        new_value,
        boolean_combination,
        feed_id,
        object_notation,
      } = req.body;
      const results = await model.query().insert({
        name,
        column,
        scope,
        equality,
        value,
        column_name_alias,
        new_value,
        boolean_combination,
        feed_id,
        object_notation,
      });
      res.json(results);
    } catch (err) {
      console.error(err);
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await model
        .query()
        .updateAndFetchById(id, req.body)
        .throwIfNotFound();
      res.json(result);
    } catch (err) {
      console.error(err);
      next(err);
    }
  },

  test: async (req, res, next) => {
    try {
      const { id } = req.params;
      const rule = await model.query().findById(id).throwIfNotFound();
      const feed_id = rule.feed_id;
      const feed = await feedModel.query().findById(feed_id).throwIfNotFound();

      await jsonToSql.createViewWithAliasedColumns(rule);
      //feed.tableName
      // const res = await jsonToSql.createViewWithAliasedColumns(
      //   feed_id,
      //   //feed.tableName
      //   "t1"
      // );
      res.json(feed);
    } catch (err) {
      next(err);
    }
  },
};
