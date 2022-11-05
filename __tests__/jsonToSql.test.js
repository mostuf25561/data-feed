"use strict";
const _ = require("lodash");
const jsonToSql = require("../lib/jsonToSql");
const constants = require("../lib/constants");
const fs = require("fs");
const path = require("path");
const { tableName } = require("../models/feed");
const { entries } = require("lodash");
const exp = require("constants");

let rules;
let apiEntries;
const optionalColumns = ["id", "created_at", "updated_at"];
beforeAll(() => {
  //load rules fixtures
  const rulesPath = path.join(__dirname, "fixtures", "rules.json");
  const apiEntriesPath = path.join(__dirname, "fixtures", "api_entries.json");

  rules = JSON.parse(fs.readFileSync(rulesPath, "utf8"));
  apiEntries = JSON.parse(fs.readFileSync(apiEntriesPath, "utf8"));
});

describe("compile rules to sql", () => {
  const expectedSqlQuery =
    ', case when ( age < 2 or age > 100 ) then "needs help" when ( age < 100 ) then "doing well" else age end as as_age, case when ( name like \'%b%\' or name like \'%c%\' ) then "has b or c" else name end as as_name';

  const expectedSqlQueryWithTimeScope =
    " where created_at >= '2011-10-06T14:48:00.000Z'";

  test("use boolean combination rules to generate and group sql conditions", async () => {
    expect(jsonToSql.convertRulesToSqlInstructions(rules)).toEqual({
      age: {
        "doing well": "age < 100",
        "needs help": "age < 2 or age > 100",
      },
      "nested.name": {
        "has b or c": "name like '%b%' or name like '%c%'",
      },
    });
  });

  test("prepare sql query from sql instruction object", async () => {
    expect(jsonToSql.convertSqlInsturctionsToSqlQueries(rules)).toBe(
      expectedSqlQuery
    );
  });

  test("generate sql where clause using the rules' time scope", async () => {
    expect(jsonToSql.sqlTimeScope(rules, "created_at")).toBe(
      expectedSqlQueryWithTimeScope
    );
  });
});

describe("generate sql queries", () => {
  beforeAll(() => {});

  test("save json to db", async () => {
    const expected = `DROP TABLE IF EXISTS t1;CREATE TABLE t1(json_col JSON);INSERT INTO t1 VALUES ('{"arr":${JSON.stringify(
      apiEntries
    )}}');`;

    expect(jsonToSql.storeJsonToDb(apiEntries, "t1")).toBe(expected);
  });

  test("view json as table", async () => {
    const tableName = "t1";

    const expected = `DROP VIEW  IF EXISTS \`v\`;
CREATE VIEW v AS 
SELECT arr.* 
FROM t1,
JSON_TABLE(json_col, '$.arr[*]' COLUMNS (
age int  PATH '$.age',name VARCHAR(100)  PATH '$.nested.name')
) arr;`;

    expect(jsonToSql.createViewWithAliasedColumns(rules, tableName)).toBe(
      expected
    );
  });

  test("view with applied conditions", async () => {
    const expected =
      'DROP VIEW IF EXISTS v2; CREATE VIEW v2 AS select *, case when ( age < 2 or age > 100 ) then "needs help" when ( age < 100 ) then "doing well" else age end as as_age, case when ( name like \'%b%\' or name like \'%c%\' ) then "has b or c" else name end as as_name from v;';
    expect(jsonToSql.createViewForMinimalColumns(rules, "v", "v2")).toBe(
      expected
    );
  });
  test("view with aliased columns only", async () => {
    const expected =
      "DROP VIEW IF EXISTS v3; CREATE VIEW v3 AS select id,created_at,updated_at,age as as_age,name as as_name from v2 where created_at >= '2011-10-06T14:48:00.000Z';";
    const sql = jsonToSql.createViewForAliasedColumns(
      rules,
      "v2",
      "v3",
      optionalColumns, //id, created_at, updated_at
      "created_at", //time scope
      true //prefer older
    );
    expect(sql).toBe(expected);
  });
  test("view with aliased columns only but without time scope", async () => {
    rules.forEach((item) => {
      if (item.scope) {
        delete item.scope;
      }
    });
    const expected =
      "DROP VIEW IF EXISTS v3; CREATE VIEW v3 AS select id,created_at,updated_at,age as as_age,name as as_name from v2;";
    const sql = jsonToSql.createViewForAliasedColumns(
      rules,
      "v2",
      "v3",
      optionalColumns
    );
    expect(sql).toBe(expected);
  });
});
