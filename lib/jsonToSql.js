//require extractService
const extractService = require("./extractService");
const _ = require("lodash");
const utils = require("./utils");
// const connection = require("../services/mysql2.js");
const knex = require("../services/knex.js");

const helpers = {
  createJsonTableFromJsonColumn: function (rules, tableSrc, tableTarget) {
    let entriesAsString = rules.map((entry) => {
      return (
        //  tmp_prefixForColumnNotation +
        entry.column_name_alias +
        " " +
        entry.type +
        "  PATH " +
        "'$." +
        entry.object_notation +
        "'"
      );
    });

    entriesAsString = _.uniq(entriesAsString, (item) => item.column_name_alias);

    function steps(entries, tableSrc, tableTarget) {
      return [
        [`DROP TABLE IF EXISTS ${tableTarget}`],
        [
          `CREATE TABLE ${tableTarget} AS SELECT arr.* FROM ${tableSrc}, JSON_TABLE(json_col, '$.arr[*]' COLUMNS ( ${entriesAsString}) ) arr;`,
        ],
      ];
    }
    return steps(entriesAsString, tableSrc, tableTarget);

    //     return `DROP TABLE  IF EXISTS ${tableTarget};
    // CREATE TABLE ${tableTarget} AS
    // ;
  },
  convertRulesToSqlInstructionsObject: (rules) => {
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
  /* run all queries in serial
  input: queries as comma saperated string or an array 
  output: array of query results
  */
  execSql: async (queries) => {
    let results = [];
    for (const query of queries) {
      if (query.length > 0) {
        console.log({ query });
        let result;
        try {
          if (typeof query === "string") {
            result = await knex.raw(query);
          } else {
            result = await knex.raw(...query);
          }
        } catch (err) {
          console.error(err);
          throw err;
        }

        results.push(result);
      }
    }
    return results;
  },
};

module.exports = {
  helpers,

  wrapJsonTable: async function (rules, tableSrc, tableTarget, feed) {
    const strQuery = this.clause.wrapJsonTable(
      rules,
      tableSrc,
      tableTarget,
      feed
    );
    try {
      const queries = strQuery.split(";");
      await helpers.execSql(queries);
      const res = await knex.raw("select * from :tableTarget:", {
        tableTarget,
      });
      return res[0];
    } catch (err) {
      throw err;
    }
  },

  createJsonTableFromJsonColumn: async function (
    rules,
    tableFrom,
    tableTarget
  ) {
    const queries = this.helpers.createJsonTableFromJsonColumn(
      rules,
      tableFrom,
      tableTarget
    );

    try {
      console.log("createJsonTableFromJsonColumn", { queries });
      const prepRes = await knex.raw(" select * from :tableFrom: ", {
        tableFrom,
      });

      await helpers.execSql(queries);
      const res = await knex.raw("select * from :tableTarget:", {
        tableTarget,
      });

      return res[0];
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  storeJsonToDb: async function (entries, tableName) {
    //chech json's hash and overwrite if it's not the same
    function steps(entries, tableNameFinal) {
      return [
        [`DROP TABLE IF EXISTS ${tableNameFinal}`],
        [`CREATE TABLE ${tableNameFinal}(json_col JSON)`],
        [`INSERT INTO ${tableNameFinal} VALUES (?)`, [entries]],
      ];
    }
    const jsonAsString = JSON.stringify({ arr: entries });
    const queries = steps(jsonAsString, tableName);
    console.log("storeJsonToDb", { queries });
    try {
      await helpers.execSql(queries);
      const res = await knex.raw("select * from :tableName:", { tableName });
      console.log(res[0]);
      return res[0];
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  clause: {
    selectClause: function (rules) {
      let sql_selectColumnsAliases = _.uniq(
        rules.map((entry) => {
          const to = utils.lastNotationString(entry.object_notation);
          const from = tmp_prefixForColumnNotation + entry.object_notation;
          return `[${entry.column_name_alias} as ${entry.column_name_alias}]`;
        })
      ).join(",");
    },
    //returns nested object where the keys are: [object_notation][new_value];

    caseClause: function (rules) {
      const groupedRules = extractService.groupRulesByNotation(rules);

      const sqlInstructions =
        helpers.convertRulesToSqlInstructionsObject(rules);
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

    whereClause: function (feed) {
      const { scope, from_scope, to_scope } = feed;
      let sqlQuery = "";

      function isDate(_date) {
        const _regExp = new RegExp(
          "^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$"
        );
        return _regExp.test(_date);
      }

      if (isDate(feed.from_scope) === true && isDate(feed.to_scope) === true) {
        if (feed.from_scope && feed.to_scope) {
          sqlQuery = [
            `where :${scope}: between :${from_scope} and :${to_scope}`,
            { scope, from_scope, to_scope },
          ];
        } else if (feed.from_scope) {
          sqlQuery = [
            `where :${scope}: > :${from_scope}`,
            { scope, from_scope, to_scope },
          ];
        } else if (feed.to_scope) {
          sqlQuery = [`where :${scope}: < :${to_scope}`, { scope, to_scope }];
        }
      } else if (feed.from_scope) {
        sqlQuery = [
          `where :${scope}: > :${from_scope}:`,
          { scope, from_scope },
        ];
      } else if (feed.to_scope) {
        sqlQuery = [`where :${scope}: < :${to_scope}:`, { scope, to_scope }];
      }

      return sqlQuery;
    },
    //store array to a new table

    //TODO: replace new table with select wrapper
    wrapJsonTable: function (rules, tableSrc, tableTarget, feed) {
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

      //use: select * sqlCase from srcTable
      const sqlCase = this.caseClause(rules);
      const whereClauseResults =
        feed && feed.scope && (feed.from_scope || feed.to_scope)
          ? this.whereClause(feed)
          : "";
      return (
        `DROP TABLE IF EXISTS ${tableTarget}; CREATE TABLE ${tableTarget} AS select ` +
        sql_select_columns_as(rules) +
        ` from ${tableSrc}` +
        (whereClauseResults || "") +
        ";"
      );
    },
  },
};
