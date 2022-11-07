const { request } = require("express");
const model = require("../models/feed");
const auth = require("../services/auth");
const axios = require("axios");
const _ = require("lodash");
const jsonToSql = require("../lib/jsonToSql");

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
      const results = await model.query().insert(req.body);
      res.json(results);
    } catch (err) {
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
      next(err);
    }
  },

  test: async (req, res, next) => {
    //fetch feed and store to db
    //TODO: cache data in db and update it when passing force=true

    //TODO: add validations
    //req.checkParams("id").isInt({ min: 0 });

    try {
      const { id } = req.params;
      const feed = await model.query().findById(id).throwIfNotFound();
      // return res.send({ feed });
      const fetchResult = await auth.getFeedData(feed.url); //getFeedDatacredentials.await axios.get(feed.url);
      // return res.send({ fetchResult });
      const entries = _.get(fetchResult, feed.root_notation);

      //save json to the db
      const result = await jsonToSql.storeJsonToDb(entries, "t1");
      res.json(result);
    } catch (err) {
      console.error({ err });
      next(err);
    }
  },
};
