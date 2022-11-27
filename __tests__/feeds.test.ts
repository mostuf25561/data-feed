/// <reference types='jest'/>

jest.setTimeout(100000);

("use strict");
const extractService = require("../lib/extractService");
const app = require("../app");
//import lodash
const _ = require("lodash");
const supertest = require("supertest");
const connections = require("./setup/connections");
const { entries } = require("lodash");
const path = require("path");
const fs = require("fs");

let matchObject;

let idToDelete;
let apiEntries;
let defaultFeed;
let addedFeed;
let rules;

const toBeAdded = {
  name: "name1",
  description: "description1",
  url: "url1",
  root_notation: null, //"nested",
};
const request = supertest(app);
const feedsEndpoint = "/api/feeds";
const currentTime = new Date().getTime();

const apiEntriesPath = path.join(__dirname, "fixtures", "api_entries.json");
const rulesPath = path.join(__dirname, "fixtures", "rules.json");

beforeAll(async () => {
  await connections.connect();
  //load rules fixtures
  rules = JSON.parse(fs.readFileSync(rulesPath, "utf8"));
  apiEntries = JSON.parse(fs.readFileSync(apiEntriesPath, "utf8"));

  addedFeed = await helpers.addFeed(toBeAdded);
  expect(addedFeed.id).toBeGreaterThan(0);
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
      .post(feedsEndpoint)
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

  test("get feed by id", async () => {
    const { id } = addedFeed;

    await request
      .get(feedsEndpoint + "/" + id)
      .expect(200)
      .then((res) => {
        expect(res.body).toStrictEqual(matchObject);
      });
  });
  test("/columns - download json from url", async () => {
    await request
      .get(feedsEndpoint + "/" + addedFeed.id)
      //   .expect(200)
      .then((res) => {
        expect(res.body).toStrictEqual(
          { ...matchObject, ...toBeAdded }
          // extractService.getObjecByRootNotation(
          //   res.body,
          //   addedFeed.root_notation
          // )
        );
      });
  });
  //test raw json
  test.skip("/raw - get data stored in json", async () => {
    await request
      .get(feedsEndpoint + "/" + addedFeed.id + "/raw")
      //   .expect(200)
      .then((res) => {
        expect(res.body).toEqual(_.get(apiEntries, addedFeed.root_notation));
      });
  });
  test("get all feeds", async () => {
    await request
      .get(feedsEndpoint)
      .expect(200)
      .then((res) => {
        expect(res.body[0]).toStrictEqual(matchObject);
      });
  });

  test("update feed by id", async () => {
    const id = 1;

    const expected = {};

    await request
      .put(feedsEndpoint + "/" + id)
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
  test("delete rule by id", async () => {
    const id = idToDelete;

    await request
      .delete(feedsEndpoint + "/" + id)

      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({ id });
      });
  });
});

matchObject = {
  created_at: expect.any(String),

  id: expect.any(Number),
  name: expect.any(String),
  root_notation: null,

  credential_id: null,
  url: "url1",
  description: expect.any(String),
  updated_at: expect.any(String),
  scope_from: null,
  scope_notation: null,
  scope_to: null,
  scope_type: null,
  hash: null,
};
defaultFeed = {
  name: "name1",
  description: "description1",
  url: "url1",
  root_notation: null, //"nested",
};

const helpers = {
  addFeed: async (feed) => {
    feed.name = feed.name + currentTime;
    const res = await request.post(feedsEndpoint).send(feed);
    return res.body;
  },
};
