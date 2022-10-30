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
  test("create a new feed", async () => {
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

  test("get feed by id", async () => {
    const id = 1;

    await request
      .get(url + "/" + id)
      .expect(200)
      .then((res) => {
        expect(res.body).toStrictEqual(matchObject);
      });
  });

  test("get all feeds", async () => {
    await request
      .get(url)
      .expect(200)
      .then((res) => {
        expect(res.body[0]).toStrictEqual(matchObject);
      });
  });

  test("update feed by id", async () => {
    const id = 1;

    const expected = {};

    await request
      .put(url + "/" + id)
      .send({
        name: "degrees1" + currentTime,
        description: "description0",
        url: "url1",
        root_notation: null,
        credential_id: null,
      })
      .expect(200)
      .then((res) => {
        expect(res.body).toStrictEqual(matchObject);
      });
  });
  test("delete feed by id", async () => {
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
  root_notation: null,

  credential_id: null,
  url: "url1",
  description: expect.any(String),
  updated_at: expect.any(String),
};
