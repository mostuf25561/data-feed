/// <reference types='jest'/>

jest.setTimeout(100000);

("use strict");
const _ = require("lodash");
const jsonToSql = require("../lib/jsonToSql");
const constants = require("../lib/constants");
const fs = require("fs");
const path = require("path");
const { tableName } = require("../models/feed");
const { entries } = require("lodash");
const exp = require("constants");
const connections = require("./setup/connections");

let rules;
let apiEntries;
beforeAll(() => {
  //load rules fixtures
  const rulesPath = path.join(__dirname, "fixtures", "rules.json");
  const apiEntriesPath = path.join(__dirname, "fixtures", "api_entries.json");

  rules = JSON.parse(fs.readFileSync(rulesPath, "utf8"));
  apiEntries = JSON.parse(fs.readFileSync(apiEntriesPath, "utf8"));
});
afterAll(async () => {
  await connections.disconnect();
});
describe.only("jsonToSql", () => {
  describe.skip("execute queries", () => {
    test("storeJsonToDb", async () => {
      const expected = [{ json_col: { arr: apiEntries } }];
      const res = await jsonToSql.storeJsonToDb(apiEntries, "t1");
      expect(res).toEqual(expected);
    });

    test("createJsonTableFromJsonColumn", async () => {
      const expected = [
        { age: 2, name: "John Smith" },
        { age: 40, name: "Sally Brown" },
        { age: 102, name: "John Johnson" },
      ];

      const sql = await jsonToSql.createJsonTableFromJsonColumn(
        rules,
        "t1",
        "v"
      );
      expect(sql).toEqual(expected);
    });
  });
  describe("compile rules to sql", () => {
    const expectedSqlQuery =
      ', case when ( age < 2 or age > 100 ) then "needs help" when ( age < 100 ) then "doing well" else age end as as_age, case when ( name like \'%b%\' or name like \'%c%\' ) then "has b or c" else name end as as_name';

    test("caseClause", async () => {
      // const expected = [
      //   {
      //     age: 2,
      //     as_age: "doing well",
      //     as_name: "John Smith",
      //     name: "John Smith",
      //   },
      //   {
      //     age: 40,
      //     as_age: "doing well",
      //     as_name: "has b or c",
      //     name: "Sally Brown",
      //   },
      //   {
      //     age: 102,
      //     as_age: "needs help",
      //     as_name: "John Johnson",
      //     name: "John Johnson",
      //   },
      // ];
      const expected =
        ', case when ( age < 2 or age > 100 ) then "needs help" when ( age < 100 ) then "doing well" else age end as as_age, case when ( name like \'%b%\' or name like \'%c%\' ) then "has b or c" else name end as as_name';
      const res = await jsonToSql.clause.caseClause(rules, "v", "v2");
      expect(res).toEqual(expected);
    });
    // test("wrapJsonTable", async () => {
    //   const expected = [
    //     { as_age: 2, as_name: "John Smith" },
    //     { as_age: 40, as_name: "Sally Brown" },
    //     { as_age: 102, as_name: "John Johnson" },
    //   ];

    //   const res = await jsonToSql.wrapJsonTable(rules, "v2", "v3");
    //   expect(res).toEqual(expected);
    // });

    test("use boolean combination rules to generate and group sql conditions", async () => {
      expect(
        jsonToSql.helpers.convertRulesToSqlInstructionsObject(rules)
      ).toEqual({
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
      expect(jsonToSql.clause.caseClause(rules)).toBe(expectedSqlQuery);
    });
    describe("where clause", () => {
      describe("generate sql where clause feed' scope and scope's range", () => {
        //use feed from_scope and to_scope to generate a where clause

        //generate sql where clause, between from_scope and to_scope
        const date_range = {
          scope: "dt",
          from_scope: "2011-10-06T14:48:00.000Z",
          to_scope: "2011-10-06T14:48:00.000Z",
        };
        const from_date = {
          scope: "dt",
          from_scope: "2011-10-06T14:48:00.000Z",
        };
        const from_name_starting_with_b = {
          scope: "name",
          from_scope: "2011-10-06T14:48:00.000Z",
        };
        const from_name_starting_with_b_till_z = {
          scope: "name",
          from_scope: "b",
          to_scope: "z",
        };
        const cases = [
          // [between_dates, "4"],
          [
            from_date,
            [
              "where :dt: > :2011-10-06T14:48:00.000Z:",
              { from_scope: "2011-10-06T14:48:00.000Z", scope: "dt" },
            ],
          ],
          // [from_name_starting_with_b, "0"],
          // [from_name_starting_with_b_till_z, "0"],
        ];
        test.each(cases)(
          "given %p  as arguments, returns %p",
          (firstArg, expectedResult) => {
            expect(jsonToSql.clause.whereClause(firstArg)).toEqual(
              expectedResult
            );
          }
        );
      });
    });
  });

  describe("generate sql queries", () => {
    beforeAll(() => {});

    test.only("save json to db", async () => {
      const expected = [
        ["DROP TABLE IF EXISTS t1"],
        ["CREATE TABLE t1(json_col JSON)"],
        ["INSERT INTO t1 VALUES (?)", expect.any(Array)],
      ];
      const res = await jsonToSql.storeJsonToDb(apiEntries, "t1");
      expect(res[0].json_col.arr).toEqual(apiEntries);
    });

    test.only("view json as table", async () => {
      const tableSrc = "t1";
      const tableTarget = "v";

      const expected = `DROP TABLE  IF EXISTS v;
CREATE TABLE v AS 
SELECT arr.* 
FROM t1,
JSON_TABLE(json_col, '$.arr[*]' COLUMNS (
from.age int  PATH '$.age',from.nested.name VARCHAR(100)  PATH '$.nested.name')
) arr;`;

      expect(
        jsonToSql.helpers.createJsonTableFromJsonColumn(
          rules,
          tableSrc,
          tableTarget
        )
      ).toBe(expected);
    });

    test.only("view with applied conditions", async () => {
      const expected =
        ', case when ( age < 2 or age > 100 ) then "needs help" when ( age < 100 ) then "doing well" else age end as as_age, case when ( name like \'%b%\' or name like \'%c%\' ) then "has b or c" else name end as as_name';
      // 'DROP TABLE IF EXISTS v2; CREATE TABLE v2 AS select *, case when ( age < 2 or age > 100 ) then "needs help" when ( age < 100 ) then "doing well" else age end as as_age, case when ( name like \'%b%\' or name like \'%c%\' ) then "has b or c" else name end as as_name from v;';
      expect(jsonToSql.clause.caseClause(rules, "v", "v2")).toBe(expected);
    });
    test.only("view with aliased columns and where clause", async () => {
      const expected =
        "DROP TABLE IF EXISTS v3; CREATE TABLE v3 AS select age as as_age,name as as_name from v2;";
      // "DROP TABLE IF EXISTS v3; CREATE TABLE v3 AS select id,created_at,updated_at,age as as_age,name as as_name from v2 where created_at >= '2011-10-06T14:48:00.000Z';";

      const sql = jsonToSql.clause.wrapJsonTable(rules, "v2", "v3");
      expect(sql).toBe(expected);
    });
    test.only("view with aliased columns ", async () => {
      rules.forEach((item) => {
        if (item.scope) {
          delete item.scope;
        }
      });
      const expected =
        "DROP TABLE IF EXISTS v3; CREATE TABLE v3 AS select age as as_age,name as as_name from v2;";
      // "DROP TABLE IF EXISTS v3; CREATE TABLE v3 AS select id,created_at,updated_at,age as as_age,name as as_name from v2;";

      const sql = jsonToSql.clause.wrapJsonTable(rules, "v2", "v3");
      expect(sql).toBe(expected);
    });
  });
});
