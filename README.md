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

NOW:

- api works:
- 1. returns a json based table
- 2. with conditions applied

- split rules table to conditions and rules:
  -- rule_set:
  - for where clause:
    --- scope-column-name  
    --- scope-column-value

TODOS:

- validate feed url
- test both helper funtions and working against real db
- test flow

LATER:

- add dummy login (use 3 different APIs)
- error handling: not-found, final
- add schema validators
