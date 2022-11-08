const { request } = require("express");
const model = require("../models/feed");
const ruleModel = require("../models/rule");

const auth = require("../services/auth");
const axios = require("axios");
const _ = require("lodash");
const jsonToSql = require("../lib/jsonToSql");
const Hashids = require("hashids");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const hashids = new Hashids();

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

  columns: async (req, res, next) => {},
  table: async (req, res, next) => {},
  raw: async (req, res, next) => {},
  //fetch new data and save it to the database if its not exists
  test: async (req, res, next) => {
    //fetch feed and store to db
    //TODO: cache data in db and update it when passing force=true

    //TODO: add validations
    //req.checkParams("id").isInt({ min: 0 });

    //TODO: use http based caching to avoid fetching the same feed
    let entities;
    try {
      const { id } = req.params;

      const feed = await model.query().findById(id).throwIfNotFound();
      console.log({ feed });
      const fetchResult = await auth.getFeedData(feed);

      if (_.isEmpty(fetchResult)) {
        throw new Error("no data found");
      }
      entries = feed.root_notation
        ? _.get(fetchResult, feed.root_notation)
        : fetchResult;
      if (_.isEmpty(entries)) {
        throw new Error(
          "no entries found on root notation: " + feed.root_notation
        );
      }

      const hash = crypto
        .createHash("md5")
        .update(JSON.stringify(fetchResult))
        .digest("hex");

      if (hash === feed.hash) {
        console.log("skip saving data");
      } else {
        console.log("save data");

        await jsonToSql.storeJsonToDb(entries, "t11");

        if (!_.isEmpty(hash)) {
          await model
            .query()
            .updateAndFetchById(id, { hash })
            .throwIfNotFound();
        }
      }

      return res.json(entries);
    } catch (err) {
      console.error({ err });
      next(err);
    }
  },
};
