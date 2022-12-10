const { request, json } = require("express");
const model = require("../models/feed");
const ruleModel = require("../models/rule");
const rulesModel = require("../models/rule");

const auth = require("../services/auth");
const axios = require("axios");
const _ = require("lodash");
const jsonToSql = require("../lib/jsonToSql");
const Hashids = require("hashids");
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

  rules: async (req, res, next) => {
    try {
      const { id } = req.params;
      const feed = await model
        .query()
        .findById(id)
        .withGraphFetched("rules")

        .throwIfNotFound();

      // const rules = await rulesModel
      //   .query()
      //   .findById(feed.id)
      //   .throwIfNotFound();

      res.json(feed);
      // jsonToSql.createJsonTableFromJsonColumn(feed);
    } catch (err) {
      next(err);
    }
  },
  columns: async (req, res, next) => {
    try {
      const { id } = req.params;
      const feed = await model
        .query()
        .findById(id)
        .withGraphFetched("rules")
        .throwIfNotFound();

      // const rules = await rulesModel
      //   .query()
      //   .findById(feed.id)
      //   .throwIfNotFound();
      // return res.json(feed);

      const resTableNew = await jsonToSql.createJsonTableFromJsonColumn(
        feed.rules,
        feed.json_table_name,
        "v" + feed.json_table_name
      );
      res.json(resTableNew);
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
  table: async (req, res, next) => {},
  test: async (req, res, next) => {
    try {
      const { id } = req.params;

      const feed = await model.query().findById(id).throwIfNotFound();
      console.log({ feed });
      const fetchResult = await auth.getFeedData(feed);
      res.json(fetchResult);
      // jsonToSql.createJsonTableFromJsonColumn(feed);
    } catch (err) {
      next(err);
    }
  },
  //fetch new data and save it to the database if its not exists
  raw: async (req, res, next) => {
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

      //fetch new json data
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
      await update_json_table_and_hash(feed, entries);

      return res.json(entries);
    } catch (err) {
      console.error({ err });
      next(err);
    }
  },
};
async function update_json_table_and_hash(feed, fetchResult) {
  const id = feed.id;
  const hash = crypto
    .createHash("md5")
    .update(JSON.stringify(fetchResult))
    .digest("hex");

  if (hash === feed.hash) {
    console.log("skip saving data");
  } else {
    console.log("save data");
    const json_table_name = "t11" + Date.now();

    if (!_.isEmpty(hash)) {
      await model
        .query()
        .updateAndFetchById(id, { hash, json_table_name })
        .throwIfNotFound();
    }
    await jsonToSql.storeJsonToDb(entries, json_table_name);
  }
}
