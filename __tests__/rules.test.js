/// <reference types='jest'/>
/* global jest */

jest.setTimeout(100000);

("use strict");
const app = require("../app");
const _ = require("lodash");
const supertest = require("supertest");
const connections = require("./setup/connections");

let matchObject;

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
      connection: "and",
      feed_id: 2,
      field_name: "field_name3",
      id: expect.any(Number),
      name: "rule3" + currentTime,
      new_value: "new_value3",
      notation: null,
      operator: "lower_then",
      scope: expect.any(String),
      value: expect.any(String),
    };
    await request
      .post(url)
      .send({
        name: "rule3" + currentTime,
        notation: null,
        field_name: "field_name3",
        operator: "lower_then",
        connection: "and",
        value: "value3" + Date.now(),
        new_value: "new_value3",
        updated_at: "2021-10-29 11:52:50",
        created_at: "2021-10-29 11:52:50",
        scope: "2021-10-29 11:52:50",
        feed_id: 2,
      })
      .expect(200)
      .then((res) => {
        expect(res.body).toStrictEqual(expected);
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
      connection: "and",
      created_at: null,
      feed_id: 2,
      field_name: expect.any(String),
      id: 3,
      name: expect.any(String),
      new_value: "new_value3",
      notation: null,
      operator: "lower_then",
      scope: expect.any(String),
      updated_at: null,
      value: "value3",
    };

    await request
      .put(url + "/" + id)
      .send({
        name: "degrees1" + currentTime,
        field_name: "aaaa" + currentTime,
      })
      .expect(200)
      .then((res) => {
        expect(res.body).toStrictEqual(matchObject);
      });
  });
  test("delete rule by id", async () => {
    const id = 3;

    await request
      .delete(url + "/" + id)

      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({ id });
      });
  });
});
matchObject = {
  connection: "or",
  created_at: expect.any(String),
  feed_id: 1,
  field_name: expect.any(String),
  id: 1,
  name: expect.any(String),
  new_value: "new_value1",
  notation: null,
  operator: "lower_then",
  scope: expect.any(String),
  updated_at: expect.any(String),
  value: expect.any(String),
};

// const initDB = () => {
//   return new Promise((resolve, reject) => {
//     db.then((conn) => {
//       console.log("connection successful");
//       connection = conn;
//       //   service.init(connection);
//       //rulesModel.init(connection);

//       resolve();
//     }).catch((err) => {
//       console.error("connection", err);
//       reject(err);
//     });
//   });
// };
