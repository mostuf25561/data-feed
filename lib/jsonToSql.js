//require extractService
const extractService = require("./extractService");

module.exports = {
  //store array to a new table t1
  storeJsonToDb: function (entries) {
    const tableNameFinal = "t1";
    const jsonObj = { arr: entries };
    const jsonAsString = JSON.stringify(jsonObj);

    return `DROP TABLE IF EXISTS ${tableNameFinal};CREATE TABLE ${tableNameFinal}(json_col JSON);INSERT INTO ${tableNameFinal} VALUES ('${jsonAsString}');`;
  },
  createView: function (entries, table_name = "v") {
    //lodash - find unique objects in rules where properties are: column_name_alias, type, object_notation

    const entriesAsString = entries
      .map((entry) => {
        return (
          entry.column_name_alias +
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
) arr;`;
  },
  createViewWithRules: function (entries, rules, table_name = "v") {
    // this.createView(entries, table_name) +
    function sql_select_columns_as(rules) {
      const columns = extractService.helpers.getUniqColumns(rules);
      return (
        columns
          // .map((column) => {
          //   return " alias_" + column; //+ " AS " + column;
          // })
          .join(",")
      );
    }
    const sqlCase = extractService.helpers.convertSqlInsturctionsToSqlQueries(
      rules,
      table_name
    );
    return (
      // this.createView(entries, table_name) +
      "DROP VIEW IF EXISTS `v2`; CREATE VIEW v2 AS " +
      "select " +
      sql_select_columns_as(rules) +
      // sqlCase +
      " from v;"
    );
  },
};
