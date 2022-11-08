const _ = require("lodash");
const constants = require("./constants");
const utils = require("./utils");
const extractService = {
  // extractAllRecords: (
  //   rawData,
  //   recordsNotation,
  //   perColumnNotations,
  //   perColumnAlias
  // ) => {
  //   let res;
  //   if (!recordsNotation) res = rawData;
  //   else res = _.get(rawData, recordsNotation);
  //   if (perColumnNotations) {
  //     res = res.map((record) => {
  //       let newRecord = {};
  //       perColumnNotations.forEach((notation, index) => {
  //         let tmpValue = _.get(record, notation, null);

  //         if (perColumnAlias) {
  //           newRecord[perColumnAlias[index]] = tmpValue;
  //         } else {
  //           newRecord[notation] = tmpValue;
  //         }
  //       });
  //       return newRecord;
  //     });
  //   }
  //   return res;
  // },
  // extractAllColumns: (rawData, recordsNotation) => {
  //   //assume same properties for all records
  //   const objs = extractService.extractAllRecords(rawData, recordsNotation);
  //   return Object.keys(objs[0]);
  // },

  // getUniqColumns: function (rules) {
  //   return _.uniqBy(rules, function (e) {
  //     return e.notation;
  //   }).map((rule) => rule.column_name_alias);
  // },

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
    const columnName = utils.lastNotationString(object_notation);
    if (equalityType === constants.equality.greater_than) {
      return `${columnName} > ${value}`;
    } else if (equalityType === constants.equality.lower_than) {
      return `${columnName} < ${value}`;
    } else if (equalityType === constants.equality.contains) {
      if (typeof value === "string") {
        return `${columnName} like '%${value}%'`;
      } else if (typeof value === "number") {
        return `${columnName} = ${value}`;
      } else throw new Error("not supported type");
    }
  },
};
module.exports = extractService;
