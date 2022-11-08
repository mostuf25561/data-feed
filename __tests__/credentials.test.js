/// <reference types='jest'/>

jest.setTimeout(100000);

("use strict");
const app = require("../app");
const _ = require("lodash");
const supertest = require("supertest");
const connections = require("./setup/connections");

let matchObject;
let idToDelete;

const request = supertest(app);
const url = "/api/credentials";
const currentTime = new Date().getTime();

beforeAll(async () => {
  connections.connect();
});
afterAll(async () => {
  await connections.disconnect();
});

describe("credential endpoint", () => {
  test("create a new credential", async () => {
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
        idToDelete = res.body.id;
      });
  });

  test("get credential by id", async () => {
    const id = 1;

    await request
      .get(url + "/" + id)
      .expect(200)
      .then((res) => {
        expect(res.body).toStrictEqual(matchObject);
      });
  });

  test("get all credentials", async () => {
    await request
      .get(url)
      .expect(200)
      .then((res) => {
        expect(res.body[0]).toStrictEqual(matchObject);
      });
  });

  test("update credential by id", async () => {
    const id = 1;

    const expected = {};

    await request
      .put(url + "/" + id)
      .send({
        name: "degrees1" + currentTime,
        url: "url1" + currentTime,
      })
      .expect(200)
      .then((res) => {
        expect(res.body).toStrictEqual(matchObject);
      });
  });
  test("delete credential by id", async () => {
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
  id: 1,
  created_at: expect.any(String),
  updated_at: expect.any(String),
  name: expect.any(String),
  token: null,
  password: null,
  url: expect.any(String),
  username: "username",
};
