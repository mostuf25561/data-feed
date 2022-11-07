//require extractService
const extractService = require("./extractService");
const _ = require("lodash");
const utils = require("./utils");
// const connection = require("../services/mysql2.js");
const knex = require("../services/knex.js");

module.exports = {
  createViewForAliasedColumns: async function (
    rules,
    tableSrc,
    tableTarget,
    optionalColumns,
    whereColumn,
    preferOlder
  ) {
    const strQuery = this.helpers.createViewForAliasedColumns(
      rules,
      tableSrc,
      tableTarget,
      optionalColumns,
      whereColumn,
      preferOlder
    );
    // return query;
    try {
      const queries = strQuery.split(";");
      await execSql(queries);
      const res = await knex.raw("select * from :tableTarget:", {
        tableTarget,
      });
      return res[0];
    } catch (err) {
      throw err;
    }
  },
  createViewForMinimalColumns: async function (rules, tableSrc, tableTarget) {
    const strQuery = this.helpers.createViewForMinimalColumns(
      rules,
      tableSrc,
      tableTarget
    );
    // return query;
    try {
      const queries = strQuery.split(";");
      await execSql(queries);
      const res = await knex.raw("select * from :tableTarget:", {
        tableTarget,
      });
      return res[0];
    } catch (err) {
      throw err;
    }
  },

  createViewWithAliasedColumns: async function (rules, tableFrom, tableTarget) {
    const strQuery = this.helpers.createViewWithAliasedColumns(
      rules,
      tableFrom,
      tableTarget
    );

    // await query;
    try {
      const queries = strQuery.split(";");
      await execSql(queries);

      const res = await knex.raw("select * from :tableTarget:", {
        tableTarget,
      });
      return res[0];
    } catch (err) {
      throw err;
    }
  },
  storeJsonToDb: async function (entries, tableName) {
    const jsonAsString = JSON.stringify({ arr: entries });
    const queries = this.helpers.storeJsonToDb(jsonAsString, tableName);
    try {
      await execSql(queries);
      const res = await knex.raw("select * from :tableName:", { tableName });
      return res[0];
    } catch (err) {
      throw err;
    }
  },
  helpers: {
    //returns nested object where the keys are: [object_notation][new_value];
    convertRulesToSqlInstructions: function (rules) {
      const sqlSuffixes = {};

      const groupedRules = extractService.groupRulesByNotation(rules);
      for (const object_notation in groupedRules) {
        for (const new_value in groupedRules[object_notation]) {
          let sqlQuery = "";

          const rulesUnderNewValue = groupedRules[object_notation][new_value];
          rulesUnderNewValue.forEach((rule, index) => {
            if (index != 0) {
              //skip first and/or combination before combined condition
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
    // selectColumnsFromView: function (tableName, optionalColumns) {
    //   let sqlQuery = `select ${str_optionalColumns}${str_columnsAsAlias}`;
    //   sqlQuery += ` from ${tableName}`;
    //   return sqlQuery;
    // },
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
        //get the alias column name from the first array's element for each  [object_notation][new_value]
        aliasColumnName = _.get(groupedRules, [object_notation, new_value])[0]
          .column_name_alias;

        sqlQuery += ` else ${utils.lastNotationString(
          object_notation
        )} end as ${aliasColumnName}`;
      }
      return sqlQuery;
    },

    sqlTimeScope: function (rules, timeColumn, preferOlder = true) {
      function isDate(_date) {
        const _regExp = new RegExp(
          "^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$"
        );
        return _regExp.test(_date);
      }
      let sqlQuery;

      const rulesWithTimeScope = rules
        .filter((item) => item.scope && isDate(item.scope) === true)
        .sort((a, b) => {
          return (
            (new Date(a.scope) - new Date(b.scope)) * (preferOlder ? 1 : -1)
          );
        })
        .map((item) => {
          return new Date(item.scope).toISOString();
        });

      if (rulesWithTimeScope.length === 0) {
        return null;
      }

      //pick the sorted list's first item
      const older = rulesWithTimeScope[0];
      sqlQuery = ` where ${timeColumn} >= '${older}'`;
      return sqlQuery;
    },

    //store array to a new table t1
    storeJsonToDb: function (entries, tableNameFinal = "t1") {
      return [
        [`DROP TABLE IF EXISTS ${tableNameFinal}`],
        [`CREATE TABLE ${tableNameFinal}(json_col JSON)`],
        [`INSERT INTO ${tableNameFinal} VALUES (?)`, [entries]],
      ];
    },

    createViewWithAliasedColumns: function (
      rules,
      tableSrc = "t1",
      tableTarget = "v"
    ) {
      let entriesAsString = rules.map((entry) => {
        return (
          utils.lastNotationString(entry.object_notation) +
          " " +
          entry.type +
          "  PATH " +
          "'$." +
          entry.object_notation +
          "'"
        );
      });

      entriesAsString = _.uniq(
        entriesAsString,
        (item) => item.column_name_alias
      );
      return `DROP VIEW  IF EXISTS ${tableTarget};
CREATE VIEW ${tableTarget} AS 
SELECT arr.* 
FROM ${tableSrc},
JSON_TABLE(json_col, '$.arr[*]' COLUMNS (
${entriesAsString})
) arr;`;
    },
    createViewForMinimalColumns: function (
      rules,
      tableSrc = "t1",
      targetTable = "v"
    ) {
      const sqlCase = this.convertSqlInsturctionsToSqlQueries(rules);
      return (
        `DROP VIEW IF EXISTS ${targetTable}; CREATE VIEW ${targetTable} AS ` +
        "select *" +
        sqlCase +
        ` from ${tableSrc};`
      );
    },

    createViewForAliasedColumns: function (
      rules,
      tableSrc = "v2",
      tableTarget = "v3",
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
      const whereClauseResults = whereColumn
        ? this.sqlTimeScope(rules, whereColumn, preferOlder)
        : null;
      return (
        `DROP VIEW IF EXISTS ${tableTarget}; CREATE VIEW ${tableTarget} AS select ` +
        str_optionalColumns +
        sql_select_columns_as(rules) +
        ` from ${tableSrc}` +
        (whereClauseResults || "") +
        ";"
      );
    },
  },
};
async function execSql(queries) {
  let results = [];
  for (const query of queries) {
    if (query.length > 0) {
      console.log({ query });
      let result;
      if (typeof query === "string") {
        result = await knex.raw(query);
      } else {
        result = await knex.raw(...query);
      }
      results.push(result);
    }
  }
  return results;
}
