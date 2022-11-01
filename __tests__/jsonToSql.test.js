"use strict";
const _ = require("lodash");
const sqls = require("../lib/jsonToSql");
const constants = require("../lib/constants");

describe("jsonToSql service", () => {
  let entries;

  beforeAll(() => {
    entries = [
      {
        name: "John Smith",
        address: "780 Mission St, San Francisco, CA 94103",
      },
      { name: "Sally Brown", address: "75 37th Ave S, St Cloud, MN 94103" },
      {
        name: "John Johnson",
        address: "1262 Roosevelt Trail, Raymond, ME 04071",
      },
    ];
  });

  test("create sql query which stores a given json to the db", async () => {
    const expected =
      'DROP TABLE IF EXISTS t1;CREATE TABLE t1(json_col JSON);INSERT INTO t1 VALUES (\'{"arr":[{"name":"John Smith","address":"780 Mission St, San Francisco, CA 94103"},{"name":"Sally Brown","address":"75 37th Ave S, St Cloud, MN 94103"},{"name":"John Johnson","address":"1262 Roosevelt Trail, Raymond, ME 04071"}]}\');';
    expect(sqls.storeJsonToDb(entries)).toBe(expected);
  });
  test("show the stored json as table", async () => {
    const expected = `DROP VIEW  IF EXISTS \`v\`;
CREATE VIEW v AS 
SELECT arr.* 
FROM t1, 
JSON_TABLE(json_col, '$.arr[*]' COLUMNS (
name VARCHAR(40)  PATH '$.name',address VARCHAR(100)  PATH '$.address')
) arr;select * from v;`;

    function createView(entries) {
      const entriesAsString = entries
        .map((entry) => {
          return (
            entry.field_name +
            " " +
            entry.type +
            "  PATH " +
            "'$." +
            entry.object_notation +
            "'"
          );
        })
        .join(",");
      return `DROP VIEW  IF EXISTS \`v\`;
CREATE VIEW v AS 
SELECT arr.* 
FROM t1, 
JSON_TABLE(json_col, '$.arr[*]' COLUMNS (
${entriesAsString})
) arr;select * from v;`;
    }
    expect(
      createView([
        {
          field_name: "name",
          type: "VARCHAR(40)",
          object_notation: "name",
        },
        {
          field_name: "address",
          type: "VARCHAR(100)",
          object_notation: "address",
        },
      ])
    ).toBe(expected);
  });
});
