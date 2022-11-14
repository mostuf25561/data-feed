/// <reference types='jest'/>
/* global jest */

jest.setTimeout(100000);

("use strict");
const app = require("../app");
const _ = require("lodash");
const supertest = require("supertest");
const connections = require("./setup/connections");

let matchObject;
let idToDelete;

const request = supertest(app);
const url = "/api/rules";
const currentTime = new Date().getTime();

beforeAll(async () => {
  connections.connect();
});
afterAll(async () => {
  await connections.disconnect();
});

describe("rule endpoint", () => {
  test("create a new rule", async () => {
    const expected = {
      boolean_combination: "and",
      feed_id: 2,
      column_name_alias: "column_name_alias3",
      id: expect.any(Number),
      new_value: "new_value3",
      equality: "lower_than",
      value: expect.any(String),
    };
    await request
      .post(url)
      .send({
        column_name_alias: "column_name_alias3",
        equality: "lower_than",
        boolean_combination: "and",
        value: "value3" + Date.now(),
        new_value: "new_value3",

        feed_id: 2,
      })
      .expect(200)
      .then((res) => {
        expect(res.body).toStrictEqual(expected);
        idToDelete = res.body.id;
      });
  });

  test("get rule by id", async () => {
    const id = 1;

    await request
      .get(url + "/" + id)
      .expect(200)
      .then((res) => {
        expect(res.body).toStrictEqual(matchObject);
      });
  });

  test("get all rules", async () => {
    await request
      .get(url)
      .expect(200)
      .then((res) => {
        expect(res.body[0]).toStrictEqual(matchObject);
      });
  });

  test("update rule by id", async () => {
    const id = 1;

    const expected = {
      boolean_combination: "and",
      created_at: null,
      feed_id: 2,
      column_name_alias: expect.any(String),
      id: 3,
      new_value: "new_value3",
      object_notation: null,
      equality: "lower_than",
      updated_at: null,
      value: "value3",
    };

    await request
      .put(url + "/" + id)
      .send({
        column_name_alias: "aaaa" + currentTime,
      })
      // .expect(200)
      .then((res) => {
        expect(res.body).toStrictEqual(matchObject);
      });
  });
  test("delete rule by id", async () => {
    const id = idToDelete;

    await request
      .delete(url + "/" + id)

      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({ id });
      });
  });
});

matchObject = {
  object_notation: "age",
  type: "int",
  boolean_combination: "or",
  created_at: expect.any(String),
  feed_id: 1,
  column_name_alias: expect.any(String),
  id: expect.any(Number),
  new_value: "needs help",
  equality: "lower_than",
  updated_at: expect.any(String),
  value: expect.any(String),
};
