const { request, json } = require("express");
const model = require("../models/credential");

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
      console.error(err);
      next(err);
    }
  },

  get: async (req, res, next) => {
    try {
      const { id } = req.params;
      const results = await model.query().findById(id).throwIfNotFound();
      res.send(results);
    } catch (err) {
      console.error(err);
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await model.query().deleteById(id).throwIfNotFound();
      res.json({ id: parseInt(id) });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const results = await model.query().insert(req.body);
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
