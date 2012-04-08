/*
 * Run with nodeunit:
 *   nodeunit --reporter nested mockery.functional.js
 */
var testCase = require('nodeunit').testCase;
var mockery = require('../mockery');
var sinon = require('sinon');
var m = require('module');

var mock_fake_module = {
    foo: function () {
        return 'mocked foo';
    }
};

function isCached(name) {
    // Super-simplistic, but good enough for the tests
    for (var id in m._cache) {
        if (id.indexOf(name) !== -1) return true;
    }

    return false;
}

module.exports = testCase({
    setUp: function (callback) {
        callback();
    },

    tearDown: function (callback) {
        mockery.disable();
        mockery.deregisterAll();
        callback();
    },

    "when nothing is registered": testCase({
        "and mockery is enabled": testCase({
            setUp: function (callback) {
                mockery.enable();
                callback();
            },

            "requiring a module causes a warning to be logged": function (test) {
                var mock_console = sinon.mock(console);
                mock_console.expects('warn').once();

                var fake_module = require('./fixtures/fake_module');
                test.equal(fake_module.foo(), 'real foo');

                mock_console.verify();
                mock_console.restore();
                test.done();
            },

            "and warnings are disabled": testCase({
                setUp: function (callback) {
                    mockery.warnOnUnregistered(false);
                    callback();
                },

                "requiring a module causes no warning to be logged": function (test) {
                    var mock_console = sinon.mock(console);
                    mock_console.expects('warn').never();

                    var fake_module = require('./fixtures/fake_module');
                    test.equal(fake_module.foo(), 'real foo');

                    mock_console.verify();
                    mock_console.restore();
                    test.done();
                }
            }),

            "and warnings are reenabled": testCase({
                setUp: function (callback) {
                    mockery.warnOnUnregistered(true);
                    callback();
                },

                "requiring a module causes a warning to be logged": function (test) {
                    var mock_console = sinon.mock(console);
                    mock_console.expects('warn').once();

                    var fake_module = require('./fixtures/fake_module');
                    test.equal(fake_module.foo(), 'real foo');

                    mock_console.verify();
                    mock_console.restore();
                    test.done();
                }
            })
        })
    }),

    "when an allowable is registered": testCase({
        setUp: function (callback) {
            mockery.registerAllowable('./fixtures/fake_module');
            callback();
        },

        "and mockery is enabled": testCase({
            setUp: function (callback) {
                mockery.enable();
                callback();
            },

            "requiring the module causes no warning to be logged": function (test) {
                var mock_console = sinon.mock(console);
                mock_console.expects('warn').never();

                var fake_module = require('./fixtures/fake_module');
                test.equal(fake_module.foo(), 'real foo');

                mock_console.verify();
                mock_console.restore();
                test.done();
            },

            "and the allowable is deregistered": testCase({
                setUp: function (callback) {
                    mockery.deregisterAllowable('./fixtures/fake_module');
                    callback();
                },

                "requiring the module causes a warning to be logged": function (test) {
                    var mock_console = sinon.mock(console);
                    mock_console.expects('warn').once();

                    var fake_module = require('./fixtures/fake_module');
                    test.equal(fake_module.foo(), 'real foo');

                    mock_console.verify();
                    mock_console.restore();
                    test.done();
                }
            })
        })
    }),

    "when an allowable is registered for unhooking": testCase({
        setUp: function (callback) {
            mockery.registerAllowable('./fixtures/fake_module', true);
            callback();
        },

        "and mockery is enabled": testCase({
            setUp: function (callback) {
                if (!this.originalCache) {
                    // Initialise a clean cache
                    this.originalCache = m._cache;
                    m._cache = {};
                }
                mockery.enable();
                callback();
            },

            tearDown: function (callback) {
                if (this.originalCache) {
                    // Restore the original cache
                    m._cache = this.originalCache;
                    this.originalCache = null;
                }
                callback();
            },

            "the module is not cached": function (test) {
                test.ok(!isCached('fixtures/fake_module'));
                test.done();
            },

            "and the module is required": testCase({
                setUp: function (callback) {
                    var fake_module = require('./fixtures/fake_module');
                    callback();
                },

                "the module is cached": function (test) {
                    test.ok(isCached('fixtures/fake_module'));
                    test.done();
                },

                "and the module is deregistered": testCase({
                    setUp: function (callback) {
                        mockery.deregisterAllowable('./fixtures/fake_module');
                        callback();
                    },

                    "the module is not cached": function (test) {
                        test.ok(!isCached('fixtures/fake_module'));
                        test.done();
                    }
                })
            }),
        })
    }),

    "when a mock is registered": testCase({
        setUp: function (callback) {
            mockery.registerMock('./fixtures/fake_module', mock_fake_module);
            callback();
        },

        "and mockery is enabled": testCase({
            setUp: function (callback) {
                mockery.enable();
                callback();
            },

            "requiring the module returns the mock instead": function (test) {
                var fake_module = require('./fixtures/fake_module');
                test.equal(fake_module.foo(), 'mocked foo');
                test.done();
            },

            "and the mock is deregistered": testCase({
                "requiring the module returns the original module": function (test) {
                    mockery.deregisterMock('./fixtures/fake_module', mock_fake_module);
                    mockery.registerAllowable('./fixtures/fake_module');
                    var fake_module = require('./fixtures/fake_module');
                    test.equal(fake_module.foo(), 'real foo');
                    test.done();
                }
            }),

            "and mockery is then disabled": testCase({
                "requiring the module returns the original module": function (test) {
                    mockery.disable();
                    var fake_module = require('./fixtures/fake_module');
                    test.equal(fake_module.foo(), 'real foo');
                    test.done();
                }
            })
        })
    }),

    "when a substitute is registered": testCase({
        setUp: function (callback) {
            mockery.registerSubstitute('./fixtures/fake_module',
                './fixtures/substitute_fake_module');
            callback();
        },

        "and mockery is enabled": testCase({
            setUp: function (callback) {
                mockery.enable();
                callback();
            },

            "requiring the module returns the substitute instead": function (test) {
                var fake_module = require('./fixtures/fake_module');
                test.equal(fake_module.foo(), 'substitute foo');
                test.done();
            }
        })
    })

});
