//require extractService
const extractService = require("./extractService");
const _ = require("lodash");
const utils = require("./utils");

module.exports = {
  //returns object where key is <the column name> . <new column name> and value is the sql where condition
  convertRulesToSqlInstructions: function (rules) {
    //TODO: lodash requirments: do not allow object_notation or new_value to contain dots
    const sqlSuffixes = {};

    const groupedRules = extractService.groupRulesByNotation(rules);
    for (const object_notation in groupedRules) {
      for (const new_value in groupedRules[object_notation]) {
        let sqlQuery = "";

        const rulesUnderNewValue = groupedRules[object_notation][new_value];
        rulesUnderNewValue.forEach((rule, index) => {
          //boolean combination strategy: add boolean combination before each combined rule unless it is the first rule
          if (index != 0) {
            sqlQuery += ` ${rule.boolean_combination} `;
          }
          sqlQuery += extractService.getProperEqualitySyntax(
            rule.equality,
            rule.value,
            rule.object_notation
          );
        });
        _.set(sqlSuffixes, [object_notation, new_value], sqlQuery);
      }
    }
    return sqlSuffixes;
  },
  selectColumnsFromView: function (tableName, optionalColumns) {
    let sqlQuery = `select ${str_optionalColumns}${str_columnsAsAlias}`;
    sqlQuery += ` from ${tableName}`;
    return sqlQuery;
  },
  convertSqlInsturctionsToSqlQueries: function (rules) {
    const groupedRules = extractService.groupRulesByNotation(rules);

    const sqlInstructions = this.convertRulesToSqlInstructions(rules);
    const sqlQueries = {};
    sqlQuery = "";
    let aliasColumnName;
    for (const object_notation in sqlInstructions) {
      sqlQuery += `, case`;
      for (var new_value in sqlInstructions[object_notation]) {
        sqlQuery += ` when ( ${sqlInstructions[object_notation][new_value]} ) then "${new_value}"`;
      }
      //get the alias column name from the first array element under the object_notation and  new_value hirarchy
      aliasColumnName = _.get(groupedRules, [object_notation, new_value])[0]
        .column_name_alias;

      sqlQuery += ` else ${utils.lastNotationString(
        object_notation
      )} end as ${aliasColumnName}`;
    }
    return sqlQuery;
  },

  sqlTimeScope: function (
    rules,
    timeColumn = "created_at",
    preferOlder = true
  ) {
    function isDate(_date) {
      const _regExp = new RegExp(
        "^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$"
      );
      return _regExp.test(_date);
    }
    let sqlQuery;

    const older = rules
      .filter((item) => item.scope && isDate(item.scope) === true)
      .sort((a, b) => {
        return (new Date(a.scope) - new Date(b.scope)) * (preferOlder ? 1 : -1);
      })
      .map((item) => {
        return new Date(item.scope).toISOString();
      })[0];

    sqlQuery = ` where ${timeColumn} >= '${older}'`;
    return sqlQuery;
  },

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
    //   extractService.convertSqlInsturctionsToSqlQueries(rules);
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
    const sqlCase = this.convertSqlInsturctionsToSqlQueries(rules);
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
    targetTable = "v3",
    optionalColumns,
    whereColumn,
    preferOlder
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
    const str_optionalColumns = optionalColumns
      ? optionalColumns.join(",") + ","
      : "";
    const sqlCase = this.convertSqlInsturctionsToSqlQueries(rules);
    return (
      // this.createViewWithAliasedColumns(entries, tableName) +
      `DROP VIEW IF EXISTS ${targetTable}; CREATE VIEW ${targetTable} AS select ` +
      str_optionalColumns +
      sql_select_columns_as(rules) +
      ` from ${sourceTable}` +
      this.sqlTimeScope(rules, whereColumn, preferOlder) +
      ";"
    );
  },
};
