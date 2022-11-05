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
beforeAll(() => {
  //load rules fixtures
  const rulesPath = path.join(__dirname, "fixtures", "rules.json");
  const apiEntriesPath = path.join(__dirname, "fixtures", "api_entries.json");

  rules = JSON.parse(fs.readFileSync(rulesPath, "utf8"));
  apiEntries = JSON.parse(fs.readFileSync(apiEntriesPath, "utf8"));
});

describe("generate sql queries", () => {
  beforeAll(() => {});

  test.only("save json to db", async () => {
    const expected = `DROP TABLE IF EXISTS t1;CREATE TABLE t1(json_col JSON);INSERT INTO t1 VALUES ('{"arr":${JSON.stringify(
      apiEntries
    )}}');`;

    expect(jsonToSql.storeJsonToDb(apiEntries, "t1")).toBe(expected);
  });

  test.only("view json as table", async () => {
    const tableName = "t1";

    // DROP VIEW  IF EXISTS `v`;
    // CREATE VIEW v AS
    // SELECT arr.*,
    //  case when ( '$.age' < 2 or '$.age' > 100 ) then "needs help" else '$.age' end
    //  FROM t1,
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

  test.only("view with applied conditions", async () => {
    const expected =
      //"DROP VIEW IF EXISTS `v2`; CREATE VIEW v2 AS select age as as_age,name as as_name from v;";
      "DROP VIEW IF EXISTS v2; CREATE VIEW v2 AS select *, case when ( name like '%b%' or name like '%c%' ) then \"has b or c\" else name end as as_name from v;";
    //`select *,
    //case when ( age < 2 or age > 100 ) then "needs help" when ( age < 100 ) then "doing well" else age end as as_age, case when ( name like '%b%' or name like '%c%' ) then "has b or c" else name end as as_name from v`;
    expect(
      jsonToSql.createViewForMinimalColumns(
        //  rulesWithAlias,
        rules,
        "v",
        "v2"
      )
    ).toBe(expected);
  });
  test.only("select only aliased columns", async () => {
    const expected =
      "DROP VIEW IF EXISTS v3; CREATE VIEW v3 AS select age as as_age,name as as_name from v2;";
    const sql = jsonToSql.createViewForAliasedColumns(rules, "v2", "v3");
    expect(sql).toBe(expected);
  });
});
