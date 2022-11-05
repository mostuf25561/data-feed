//require extractService
const extractService = require("./extractService");
const _ = require("lodash");
const utils = require("./utils");

module.exports = {
  //store array to a new table t1
  storeJsonToDb: function (entries, tableNameFinal = "t1") {
    const jsonObj = { arr: entries };
    const jsonAsString = JSON.stringify(jsonObj);

    return `DROP TABLE IF EXISTS ${tableNameFinal};CREATE TABLE ${tableNameFinal}(json_col JSON);INSERT INTO ${tableNameFinal} VALUES ('${jsonAsString}');`;
  },

  createViewWithAliasedColumns: function (rules, tableName = "t1") {
    let entriesAsString = rules.map((entry) => {
      return (
        utils.lastNotationString(entry.object_notation) +
        // entry.column_name_alias +
        " " +
        entry.type +
        "  PATH " +
        "'$." +
        entry.object_notation +
        "'"
      );
    });
    // const sqlCase =
    //   extractService.helpers.convertSqlInsturctionsToSqlQueries(rules);
    entriesAsString = _.uniq(entriesAsString, (item) => item.column_name_alias);
    return `DROP VIEW  IF EXISTS \`v\`;
CREATE VIEW v AS 
SELECT arr.* 
FROM ${tableName},
JSON_TABLE(json_col, '$.arr[*]' COLUMNS (
${entriesAsString})
) arr;`;
  },
  createViewForMinimalColumns: function (
    rules,
    tableName = "v",
    targetTable = "v2"
  ) {
    const sqlCase =
      extractService.helpers.convertSqlInsturctionsToSqlQueries(rules);
    return (
      // this.createViewWithAliasedColumns(entries, tableName) +
      `DROP VIEW IF EXISTS ${targetTable}; CREATE VIEW ${targetTable} AS ` +
      "select *" +
      sqlCase +
      ` from ${tableName};`
    );
  },

  createViewForAliasedColumns: function (
    rules,
    sourceTable = "v2",
    targetTable = "v3"
  ) {
    function sql_select_columns_as(rules) {
      return _.uniq(
        rules.map((entry) => {
          return (
            utils.lastNotationString(entry.object_notation) +
            " as " +
            entry.column_name_alias
          );
        })
      ).join(",");
    }
    const sqlCase =
      extractService.helpers.convertSqlInsturctionsToSqlQueries(rules);
    return (
      // this.createViewWithAliasedColumns(entries, tableName) +
      `DROP VIEW IF EXISTS ${targetTable}; CREATE VIEW ${targetTable} AS select ` +
      sql_select_columns_as(rules) +
      ` from ${sourceTable};`
    );
  },
};
