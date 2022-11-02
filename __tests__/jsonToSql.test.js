"use strict";
const _ = require("lodash");
const jsonToSql = require("../lib/jsonToSql");
const constants = require("../lib/constants");
const fs = require("fs");
const path = require("path");
let rules;
const rulesWithAlias = [
  {
    column_name_alias: "name",
    type: "VARCHAR(40)",
    object_notation: "name",
  },
  {
    column_name_alias: "address",
    type: "VARCHAR(100)",
    object_notation: "address",
  },
];
beforeAll(() => {
  //load rules fixtures
  const rulesPath = path.join(__dirname, "fixtures", "rules.json");

  rules = JSON.parse(fs.readFileSync(rulesPath, "utf8"));
});

describe("jsonToSql service", () => {
  let entries;

  beforeAll(() => {
    entries = [
      {
        name: "John Smith",
        address: "780 Mission St, San Francisco, CA 94103",
        age: 2,
      },
      {
        name: "Sally Brown",
        address: "75 37th Ave S, St Cloud, MN 94103",
        age: 40,
      },
      {
        name: "John Johnson",
        address: "1262 Roosevelt Trail, Raymond, ME 04071",
        age: 102,
      },
    ];
  });

  test("create sql query which stores a given json to a db table", async () => {
    const expected =
      'DROP TABLE IF EXISTS t1;CREATE TABLE t1(json_col JSON);INSERT INTO t1 VALUES (\'{"arr":[{"name":"John Smith","address":"780 Mission St, San Francisco, CA 94103","age":2},{"name":"Sally Brown","address":"75 37th Ave S, St Cloud, MN 94103","age":40},{"name":"John Johnson","address":"1262 Roosevelt Trail, Raymond, ME 04071","age":102}]}\');';

    expect(jsonToSql.storeJsonToDb(entries)).toBe(expected);
  });
  test("create sql query which creates a view for showing the stored json as table", async () => {
    const expected = `DROP VIEW  IF EXISTS \`v\`;
CREATE VIEW v AS 
SELECT arr.* 
FROM t1, 
JSON_TABLE(json_col, '$.arr[*]' COLUMNS (
name VARCHAR(40)  PATH '$.name',address VARCHAR(100)  PATH '$.address')
) arr;`; //select * from v;

    expect(jsonToSql.createView(rulesWithAlias)).toBe(expected);
  });

  test("create sql query which shows the stored json as table with applied rules", async () => {
    const expected =
      "DROP VIEW IF EXISTS `v2`; CREATE VIEW v2 AS select as_age,as_name from v;";
    //`select *,
    //case when ( age < 2 or age > 100 ) then "needs help" when ( age < 100 ) then "doing well" else age end as as_age, case when ( name like '%b%' or name like '%c%' ) then "has b or c" else name end as as_name from v`;
    const rulesWithAliasAndConditions = rules;
    expect(
      jsonToSql.createViewWithRules(rulesWithAlias, rulesWithAliasAndConditions)
    ).toBe(expected);
  });
});
