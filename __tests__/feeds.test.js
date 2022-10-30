/// <reference types='jest'/>

jest.setTimeout(100000);

("use strict");
const app = require("../app");
const _ = require("lodash");
const supertest = require("supertest");
const connections = require("./setup/connections");

let matchObject;

const request = supertest(app);
const url = "/api/feeds";
const currentTime = new Date().getTime();

beforeAll(async () => {
  connections.connect();
});
afterAll(async () => {
  await connections.disconnect();
});

describe("feed endpoint", () => {
  test.only("create a new feed", async () => {
    const expected = {
      name: expect.any(String),
      url: expect.any(String),
      id: expect.any(Number),
    };
    await request
      .post(url)
      .send({
        name: "name0" + currentTime,
        url: "url0" + currentTime,
      })
      // .expect(200)
      .then((res) => {
        expect(res.body).toStrictEqual(expected);
      });
  });

  test.only("get feed by id", async () => {
    const id = 1;

    await request
      .get(url + "/" + id)
      .expect(200)
      .then((res) => {
        expect(res.body).toStrictEqual(matchObject);
      });
  });

  test.only("get all feeds", async () => {
    await request
      .get(url)
      .expect(200)
      .then((res) => {
        expect(res.body[0]).toStrictEqual(matchObject);
      });
  });

  test.only("update feed by id", async () => {
    const id = 1;

    const expected = {};

    await request
      .put(url + "/" + id)
      .send({
        name: "degrees1" + currentTime,
        description: "description0",
        url: "url1",
        root_notation: null,
        login_id: null,
      })
      .expect(200)
      // table.engine("Innodb");
      // table.charset("UTF8");

      // table.increments("id").primary();

      // table.string("name", 100).unique().notNull();
      // table.string("description").notNull();

      // //array_notation
      // table.string("url").notNull(); //notation inside array of entries

      // table.string("root_notation").notNull(); //notation inside array of entries

      // //foreign keys
      // table.integer("login_id").unsigned().references("logins.id");
      .then((res) => {
        expect(res.body).toStrictEqual(matchObject);
      });
  });
  test.only("delete feed by id", async () => {
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
  created_at: expect.any(String),

  id: 1,
  name: expect.any(String),
  created_at: expect.any(String),

  login_id: null,
  root_notation: null,
  url: "url1",
  description: "description0",
  updated_at: expect.any(String),
};
