var vows = require('vows'),
    assert = require('assert'),
    mockery = require('../mockery');
 
var registerBin = function () {
    var error = 0;
    mockery.enable({
        warnOnUnregistered: false,
        useCleanCache: true
    });
    try {
        require('unix-dgram'); //or some other binary module
    } catch (err) {
        error = 1;
    }
    mockery.deregisterAll();
    mockery.disable();
    return error;
};

var tests = {
    "register bin": {
        topic: function () {
            var errors = 0;
            for (var i = 0; i < 10; i++) {
                errors += registerBin();
            }
            return errors;
        },
        "should be able to register a bin module multiple times": function(topic) {
            assert.equal(topic, 0);
        }
    }
};

vows.describe('module-failed-to-self-register').addBatch(tests).export(module);
