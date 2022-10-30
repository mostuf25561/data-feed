#!/usr/bin/bash

npm run down
npm run up
npm run seed

reset;./node_modules/.bin/jest __tests__/rules.test.js 