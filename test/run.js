#!/usr/bin/env node
var test_reporter = require('nodeunit').reporters.nested;
test_reporter.run(['./mockery.unit.js', './mockery.functional.js']);
