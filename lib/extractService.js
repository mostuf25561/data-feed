const _ = require("lodash");
const constants = require("./constants");
const extractService = {
  extractAllRecords: (
    rawData,
    recordsNotation,
    perColumnNotations,
    perColumnAlias,
    rules
  ) => {
    let res;
    if (!recordsNotation) res = rawData;
    else res = _.get(rawData, recordsNotation);
    if (perColumnNotations) {
      res = res.map((record) => {
        let newRecord = {};
        perColumnNotations.forEach((notation, index) => {
          let tmpValue = _.get(record, notation, null);

          if (perColumnAlias) {
            newRecord[perColumnAlias[index]] = tmpValue;
          } else {
            newRecord[notation] = tmpValue;
          }
        });
        return newRecord;
      });
    }
    return res;
  },
  extractAllColumns: (rawData, recordsNotation) => {
    //assume same properties for all records
    const objs = extractService.extractAllRecords(rawData, recordsNotation);
    return Object.keys(objs[0]);
  },
  helpers: {
    groupRulesByNotation: function (rules) {
      return rules.reduce((acc, rule) => {
        const notation = rule.notation;
        const newValue = rule.new_value;

        acc[notation] = acc[notation] ? acc[notation] : {};
        if (acc[notation][newValue]) {
          acc[notation][newValue].push(rule);
        } else {
          acc[notation][newValue] = [rule];
        }
        return acc;
      }, {});
    },
    getProperEqualitySyntax: function (equalityType, value, notation) {
      //convert value to number if it is a number
      if (equalityType === constants.equality.bigger_than) {
        return `${notation} > ${value}`;
      } else if (equalityType === constants.equality.lower_than) {
        return `${notation} < ${value}`;
      } else if (equalityType === constants.equality.contains) {
        if (typeof value === "string") {
          return `${notation} like '%${value}%'`;
        } else if (typeof value === "number") {
          return `${notation} = ${value}`;
        } else throw new Error("not supported type");
      }
    },

    //returns object where key is <the column name> . <new column name> and value is the sql where condition
    convertRulesToSqlInstructions: function (rules) {
      //TODO: lodash requirments: do not allow notation or new_value to contain dots
      const sqlSuffixes = {};

      const groupedRules = this.groupRulesByNotation(rules);

      for (const notation in groupedRules) {
        for (const new_value in groupedRules[notation]) {
          let sqlQuery = "";

          const rules = groupedRules[notation][new_value];
          rules.forEach((rule, index) => {
            //boolean combination strategy: add boolean combination before each combined rule unless it is the first rule
            if (index != 0) {
              sqlQuery += ` ${rule.boolean_combination} `;
            }
            sqlQuery += this.getProperEqualitySyntax(
              rule.equality,
              rule.value,
              rule.notation
            );
          });
          _.set(sqlSuffixes, notation + "." + new_value, sqlQuery);
        }
      }
      return sqlSuffixes;
    },

    convertSqlInsturctionsToSqlQueries: function (rules) {
      const groupedRules = this.groupRulesByNotation(rules);

      const sqlInstructions = this.convertRulesToSqlInstructions(rules);
      const table_name = "feeds";
      const sqlQueries = {};
      let sqlQuery = `select *, case`;
      let aliasColumnName;
      for (const notation in sqlInstructions) {
        for (var new_value in sqlInstructions[notation]) {
          sqlQuery += ` when ( ${sqlInstructions[notation][new_value]} ) then "${new_value}"`;
        }
        aliasColumnName = _.get(
          groupedRules,
          `${notation}.${new_value}[0].colNameAlias`
        );
        sqlQuery += ` else ${notation} end as ${aliasColumnName}`;
      }
      sqlQuery += ` from ${table_name}`;
      return sqlQuery;
    },

    convertSqlInsturctionsToSqlQueriesAndAddTimeScope: function (
      rules,
      timeColumn = "created_at"
    ) {
      function isDate(_date) {
        const _regExp = new RegExp(
          "^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$"
        );
        return _regExp.test(_date);
      }
      let sqlQuery = this.convertSqlInsturctionsToSqlQueries(rules);

      const older = rules
        .filter((item) => item.scope && isDate(item.scope) === true)
        .sort((a, b) => {
          return new Date(a.scope) - new Date(b.scope);
        })
        .map((item) => {
          return new Date(item.scope).toISOString();
        })[0];

      sqlQuery += ` where ${timeColumn} > '${older}'`;
      return sqlQuery;
    },
  },
};
module.exports = extractService;