const model = require("../models/rule");

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
};
