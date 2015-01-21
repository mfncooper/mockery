var vows = require('vows'),
    assert = require('assert'),
    mockery = require('../mockery'),
    sinon = require('sinon'),
    m = require('module');

function isCached(name) {
    var id;
    // Super-simplistic, but good enough for the tests
    for (id in m._cache) {
        if (m._cache.hasOwnProperty(id) && id.indexOf(name) !== -1) {
            return true;
        }
    }
    return false;
}


var tests = {
    "when an allowable is registered for unhooking": {
        topic: function () {
            mockery.registerAllowable('./fixtures/fake_module', true);
            return null;
        },
        "and mockery is enabled": {
            setup: function () {
                if (!this.originalCache) {
                    // Initialise a clean cache
                    this.originalCache = m._cache;
                    m._cache = {};
                }
                mockery.enable();
            },
            teardown: function () {
                if (this.originalCache) {
                    // Restore the original cache
                    m._cache = this.originalCache;
                    this.originalCache = null;
                }
            },
            "the module is not cached": function () {
                assert.ok(!isCached('fixtures/fake_module'));
            },

            "and the module is required": {
                topic: function () {
                    require('./fixtures/fake_module');
                    return null;
                },

                "the module is cached": function () {
                    assert.ok(isCached('fixtures/fake_module'));
                },

                "and the module is deregistered": {
                    topic: function () {
                        mockery.deregisterAllowable('not-allowed-already');
                        mockery.deregisterAllowable('./fixtures/fake_module');
                        return null;
                    },

                    "the module is not cached": function () {
                        assert.ok(!isCached('fixtures/fake_module'));
                    }
                }
            }
        }
    }
};

vows.describe('allowable-unhook').addBatch(tests).export(module);
