- run tests:

```sh
#migrate, seed data and run tests:
npm run down
npm run up
npm run seed
./node_modules/.bin/jest __tests__/*.test.js
```

TODOS:

- dynamicly create new tables (bigQuery?)
- add dummy login (use 3 different APIs)
- error handling: not-found, final
- add schema validators
- setup jest config
- dynamicly define type of aliased column
