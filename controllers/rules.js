const model = require("../models/rule");

module.exports = {
  list: async (req, res, next) => {
    try {
      const { id } = req.params;
      const results = await model.query().select();
      res.send(results);
    } catch (err) {
      console.error(err);
      next(err);
    }
  },

  get: async (req, res, next) => {
    try {
      const { id } = req.params;
      const results = await model.query().findById(1);
      res.send(results);
    } catch (err) {
      console.error(err);
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await model.query().deleteById(id);
      res.json({ id: parseInt(id) });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const {
        name,
        column,
        scope,
        operator,
        value,
        field_name,
        new_value,
        connection,
        feed_id,
        notation,
      } = req.body;
      const results = await model.query().insert({
        name,
        column,
        scope,
        operator,
        value,
        field_name,
        new_value,
        connection,
        feed_id,
        notation,
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

      const result = await model.query().updateAndFetchById(id, req.body);
      res.json(result);
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
};