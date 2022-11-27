/// <reference types='jest'/>

jest.setTimeout(100000);

("use strict");
const app = require("../app");
const _ = require("lodash");
const supertest = require("supertest");
const connections = require("./setup/connections");

let matchObject;
let defaultCredentials;
let idToDelete;
let addedCredentials;

const request = supertest(app);
const credentialsEndpoint = "/api/credentials";
const currentTime = new Date().getTime();

beforeAll(async () => {
  await connections.connect();
  addedCredentials = await helpers.addCredentials({
    name: "name" + currentTime,
  });
  idToDelete = addedCredentials.id;
});
afterAll(async () => {
  await connections.disconnect();
});

describe("credential endpoint", () => {
  test("should return 200", async () => {
    expect(addedCredentials.id).toBeGreaterThan(0);
  });

  test("create a new credential", async () => {
    const payload = {
      //  ...defaultCredentials,
      name: "name0" + currentTime,
      url: "url0" + currentTime,
    };
    await request
      .post(credentialsEndpoint)
      .send(payload)
      // .expect(200)
      .then((res) => {
        expect(res.body).toStrictEqual({ ...payload, id: expect.any(Number) });
      });
  });

  test("get credential by id", async () => {
    const id = addedCredentials.id;

    await request
      .get(credentialsEndpoint + "/" + id)
      .expect(200)
      .then((res) => {
        expect(res.body.id).toStrictEqual(id);
      });
  });

  test("get all credentials", async () => {
    await request
      .get(credentialsEndpoint)
      .expect(200)
      .then((res) => {
        expect(res.body[res.body.length - 1]).toMatchObject({
          ...matchObject,
          password: null,
          token: null,
          username: null,
        });
      });
  });

  test("update credential by id", async () => {
    const id = idToDelete;

    const expected = {};

    await request
      .put(credentialsEndpoint + "/" + id)
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
      .delete(credentialsEndpoint + "/" + id)

      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({ id });
      });
  });
});

matchObject = {
  id: expect.any(Number),
  created_at: expect.any(String),
  updated_at: expect.any(String),
  name: expect.any(String),
  token: expect.any(String),
  password: expect.any(String),
  url: expect.any(String),
  username: expect.any(String),
};

defaultCredentials = {
  name: "name0" + currentTime,
  token: "token0" + currentTime,
  password: "password0" + currentTime,
  url: "url0" + currentTime,
  username: "username0" + currentTime,
};

const helpers = {
  addCredentials: async (credentials) => {
    const currentTime = new Date().getTime();

    const res = await request.post(credentialsEndpoint).send({
      ...defaultCredentials,
      ...credentials,
    });
    return res.body;
  },
};
