const _ = require("lodash");
const constants = require("./constants");
const extractService = {
  extractAllRecords: (
    rawData,
    recordsNotation,
    perColumnNotations,
    perColumnAlias
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
    getUniqColumns: function (rules) {
      return _.uniqBy(rules, function (e) {
        return e.column_name_alias;
      }).map((rule) => rule.column_name_alias);
    },

    groupRulesByNotation: function (rules) {
      return rules.reduce((acc, rule) => {
        const object_notation = rule.object_notation;
        const newValue = rule.new_value;

        acc[object_notation] = acc[object_notation] ? acc[object_notation] : {};
        if (acc[object_notation][newValue]) {
          acc[object_notation][newValue].push(rule);
        } else {
          acc[object_notation][newValue] = [rule];
        }
        return acc;
      }, {});
    },
    getProperEqualitySyntax: function (equalityType, value, object_notation) {
      //convert value to number if it is a number
      if (equalityType === constants.equality.bigger_than) {
        return `${object_notation} > ${value}`;
      } else if (equalityType === constants.equality.lower_than) {
        return `${object_notation} < ${value}`;
      } else if (equalityType === constants.equality.contains) {
        if (typeof value === "string") {
          return `${object_notation} like '%${value}%'`;
        } else if (typeof value === "number") {
          return `${object_notation} = ${value}`;
        } else throw new Error("not supported type");
      }
    },

    //returns object where key is <the column name> . <new column name> and value is the sql where condition
    convertRulesToSqlInstructions: function (rules) {
      //TODO: lodash requirments: do not allow object_notation or new_value to contain dots
      const sqlSuffixes = {};

      const groupedRules = this.groupRulesByNotation(rules);

      for (const object_notation in groupedRules) {
        for (const new_value in groupedRules[object_notation]) {
          let sqlQuery = "";

          const rules = groupedRules[object_notation][new_value];
          rules.forEach((rule, index) => {
            //boolean combination strategy: add boolean combination before each combined rule unless it is the first rule
            if (index != 0) {
              sqlQuery += ` ${rule.boolean_combination} `;
            }
            sqlQuery += this.getProperEqualitySyntax(
              rule.equality,
              rule.value,
              rule.object_notation
            );
          });
          _.set(sqlSuffixes, object_notation + "." + new_value, sqlQuery);
        }
      }
      return sqlSuffixes;
    },

    convertSqlInsturctionsToSqlQueries: function (rules, table_name) {
      const groupedRules = this.groupRulesByNotation(rules);

      const sqlInstructions = this.convertRulesToSqlInstructions(rules);
      const sqlQueries = {};
      let sqlQuery = `select *`;
      let aliasColumnName;
      for (const object_notation in sqlInstructions) {
        sqlQuery += `, case`;
        for (var new_value in sqlInstructions[object_notation]) {
          sqlQuery += ` when ( ${sqlInstructions[object_notation][new_value]} ) then "${new_value}"`;
        }
        aliasColumnName = _.get(
          groupedRules,
          `${object_notation}.${new_value}[0].column_name_alias`
        );
        sqlQuery += ` else ${object_notation} end as ${aliasColumnName}`;
      }
      // sqlQuery += ` from ${table_name}`;
      return sqlQuery;
    },

    sqlTimeScope: function (rules, timeColumn = "created_at") {
      function isDate(_date) {
        const _regExp = new RegExp(
          "^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$"
        );
        return _regExp.test(_date);
      }
      let sqlQuery; //= this.convertSqlInsturctionsToSqlQueries(rules, table_name);

      const older = rules
        .filter((item) => item.scope && isDate(item.scope) === true)
        .sort((a, b) => {
          return new Date(a.scope) - new Date(b.scope);
        })
        .map((item) => {
          return new Date(item.scope).toISOString();
        })[0];

      sqlQuery = ` where ${timeColumn} > '${older}'`;
      return sqlQuery;
    },
  },
};
module.exports = extractService;
