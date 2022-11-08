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

FLOW:

- add a feed
- view it

- add few rules
- view it

- add time scope
- view it

- add column aliases
- view it

NOW:

- npx jest **tests**/feeds.test.js --watch
- api works:
  feed:
- 0. test:
     -- if exists
- 1. create: return table
- 2. edit:
- ## view
- update
  -- select

- 2.  on rules create -> return table with applied conditions
- 2.1 apply aliased
- 2.2 apply apply
-
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
