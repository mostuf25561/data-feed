- run tests:

```sh
#install and run docker of mysql
npm i
docker-compose up

#migrate, seed data and run tests:
npm run down
npm run up
npm run seed

#run tests
./node_modules/.bin/jest __tests__/*.test.js
```

TODOS:

- table: credentials - set uniqu index for url and token or url with username
- replace as\_<colName> with <colName>
- dynamicly create new tables (bigQuery?)
- add dummy login (use 3 different APIs)
- error handling: not-found, final
- add schema validators
- setup jest config
- dynamicly define type of aliased column

add it to the seeds:
const [
{
column_name_alias: "name",
type: "VARCHAR(40)",
object_notation: "name",
},
{
column_name_alias: "address",
type: "VARCHAR(100)",
object_notation: "address",
},
{
column_name_alias: "age",
type: "INT",
object_notation: "age",
},
],
