const sqls = {
  //store array to a new table t1
  storeJsonToDb: function (entries) {
    const tableNameFinal = "t1";
    const jsonObj = { arr: entries };
    const jsonAsString = JSON.stringify(jsonObj);

    return `DROP TABLE IF EXISTS ${tableNameFinal};CREATE TABLE ${tableNameFinal}(json_col JSON);INSERT INTO ${tableNameFinal} VALUES ('${jsonAsString}');`;
  },
};

module.exports = sqls;
