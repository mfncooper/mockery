/*
 * Run with nodeunit:
 *   nodeunit --reporter nested mockery.functional.js
 */
var testCase = require('nodeunit').testCase;
var mockery = require('../mockery');
var sinon = require('sinon');

var mock_fake_module = {
    foo: function () {
        return 'mocked foo';
    }
};

module.exports = testCase({
    setUp: function (callback) {
        callback();
    },

    tearDown: function (callback) {
        mockery.disable();
        mockery.deregisterAll();
        callback();
    },

    "when a mock is not registered": testCase({
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
            }
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
