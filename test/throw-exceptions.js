var vows = require('vows'),
    assert = require('assert'),
    mockery = require('../mockery'),
    sinon = require('sinon');

var tests = {
    teardown: function () {
        mockery.disable();
        mockery.deregisterAll();
    },
    "when nothing is registered": {
        topic: function () {
            mockery.enable();
            mockery.registerAllowable('../package.json', true);
            require('../package.json');
            return null;
        },
        "and throw exceptions enabled": {
            topic: function() {
                mockery.throwOnUnregistered(true);
                return null;
            },
            "requiring a module causes an exception to be thrown": function() {
                assert.throws(function() {
                    require('./fixtures/fake_module');
                }, /loading non-allowed module/);
            },

            "and throw exceptions not enabled": {
                topic: function() {
                    mockery.throwOnUnregistered(false);
                    return null;
                },
                "requiring a module causes an exception to be thrown": function() {
                    fake_module = require('./fixtures/fake_module');
                    assert.equal(fake_module.foo(), 'real foo');
                }
            }
        }
    }
};

vows.describe('throw-exceptions').addBatch(tests).export(module);
