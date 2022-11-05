"use strict";
const _ = require("lodash");
const extractService = require("../lib/extractService");
const constants = require("../lib/constants");
const fs = require("fs");
const path = require("path");

let rules;
beforeAll(() => {
  const rulesPath = path.join(__dirname, "fixtures", "rules.json");
  rules = JSON.parse(fs.readFileSync(rulesPath, "utf8"));
});

describe("[data input] extract raw data to rows and columns", () => {
  test("extract all records when data is an array", async () => {
    const data = [{ name: "a" }, { name: "b" }];

    //
    const res = extractService.extractAllRecords(data);
    expect(res).toHaveLength(2);
  });
  test("extract all records when data is an object", async () => {
    const data = { result: [{ name: "a" }, { name: "b" }] };

    //
    const res = extractService.extractAllRecords(data, "result");
    expect(res[0]).toEqual({ name: "a" });

    expect(res).toHaveLength(2);
  });
  test("extract all columns when data is an object", async () => {
    const data = { result: [{ name: "a", last: "k" }] };

    //
    const res = extractService.extractAllColumns(data, "result");
    expect(res).toEqual(["name", "last"]);
  });
  test("extract all columns with per-columnn notation", async () => {
    const data = { result: [{ name: "a", extras: { last: "k" } }] };

    const res = extractService.extractAllRecords(data, "result", [
      "name",
      "extras.last",
    ]);
    expect(res[0]).toEqual({ name: "a", "extras.last": "k" });
  });
  test("extract all columns with per-columnn notation and with column aliases", async () => {
    const data = {
      result: [
        { name: "b", extras: { last: "z" } },
        { name: "a", extras: { last: "k" } },
      ],
    };

    //
    const res = extractService.extractAllRecords(
      data,
      "result",
      ["name", "extras.last"],
      ["as_name", "as_last"]
    );
    expect(res[1]).toEqual({ as_name: "a", as_last: "k" });
  });
});
describe("group rules", () => {
  it("should group rules by service", () => {
    const columns = Object.keys(
      extractService.helpers.groupRulesByNotation(rules)
    );
    expect(columns).toEqual(["age", "nested.name"]);
  });
});
describe("create sql query from rules", () => {
  let data;
  let expected;
  const expectedSqlQuery =
    // 'select *, case when ( age < 2 or age > 100 ) then "needs help" when ( age < 100 ) then "doing well" else age end as as_age, case when ( nested.name like \'%b%\' or nested.name like \'%c%\' ) then "has b or c" else nested.name end as as_name';, case when ( name like '%b%' or name like '%c%' ) then \"has b or c\" else name end as as_name"
    ", case when ( name like '%b%' or name like '%c%' ) then \"has b or c\" else name end as as_name";

  const expectedSqlQueryWithTimeScope =
    " where created_at > '2011-10-06T14:48:00.000Z'";

  beforeAll(async () => {
    data = {
      result: [
        { name: "a", extras: { last: "k" }, age: 50 },
        { name: "bb", extras: { last: "k" }, age: 102 },
        { name: "aa", extras: { last: "k" }, age: 1 },
      ],
    };
    expected = [
      { as_name: "a", as_age: "needs help" },
      { as_name: "aa", as_age: "needs help" },
    ];
  });

  test("group rules by column notation and by new value (convertion target)", async () => {
    expect(extractService.helpers.groupRulesByNotation(rules)).toEqual({
      "nested.name": {
        "has b or c": [
          {
            boolean_combination: "or",
            column_name_alias: "as_name",
            equality: "contains",
            new_value: "has b or c",
            object_notation: "nested.name",
            scope: "2011-10-06T14:48:00.000Z",
            value: "b",
            type: "VARCHAR(100)",
          },
          {
            boolean_combination: "or",
            column_name_alias: "as_name",
            equality: "contains",
            new_value: "has b or c",
            object_notation: "nested.name",
            value: "c",
            scope: "2012-10-06T14:48:00.000Z",
            type: "VARCHAR(100)",
          },
        ],
      },
      age: {
        "doing well": [
          {
            boolean_combination: constants.boolean_combination.or,
            equality: "lower_than",
            new_value: "doing well",
            object_notation: "age",
            value: 100,
            column_name_alias: "as_age",
            type: "int",
          },
        ],
        "needs help": [
          {
            boolean_combination: constants.boolean_combination.or,
            equality: "lower_than",
            new_value: "needs help",
            object_notation: "age",
            value: 2,
            column_name_alias: "as_age",
            type: "int",
          },
          {
            boolean_combination: constants.boolean_combination.or,
            equality: "bigger_than",
            new_value: "needs help",
            object_notation: "age",
            value: 100,
            column_name_alias: "as_age",
            type: "int",
          },
        ],
      },
    });
  });

  test("group rules by json notation and ", async () => {
    expect(extractService.helpers.convertRulesToSqlInstructions(rules)).toEqual(
      {
        age: {
          "doing well": "age < 100",
          "needs help": "age < 2 or age > 100",
        },
        "nested.name": {
          // "has b or c": "nested.name like '%b%' or nested.name like '%c%'",
          "has b or c": "name like '%b%' or name like '%c%'",
        },
      }
    );
  });

  test("prepare sql query from sql instruction object", async () => {
    expect(
      extractService.helpers.convertSqlInsturctionsToSqlQueries(rules, [
        "id",
        "created_at",
        "updated_at",
      ])
    ).toBe(expectedSqlQuery);
  });

  test("prepare sql query from sql instruction object with time scope", async () => {
    expect(extractService.helpers.sqlTimeScope(rules)).toBe(
      expectedSqlQueryWithTimeScope
    );
  });
});
