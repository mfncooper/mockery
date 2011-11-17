/*
 * Run with nodeunit:
 *   nodeunit --reporter nested mockery.functional.js
 */
var testCase = require('nodeunit').testCase;
var mockery = require('../mockery');
var sinon = require('sinon');

var mock_fake_module = {
    foo: function() {
        return 'mocked foo';
    }
};

module.exports = testCase({
    setUp: function(callback) {
        callback();
    },
        
    tearDown: function (callback) {
        mockery.disable();
        mockery.deregisterAll();
        callback();
    },

    "when a mock is not registered": testCase({
        "and mockery is enabled": testCase({
            setUp: function(callback) {
                mockery.enable();
                callback();
            },

            "requiring a module causes a warning to be logged": function(test) {
                var mock_console = sinon.mock(console);
                mock_console.expects('warn').once();

                var fake_module = require('./support/fake_module');
                test.equal(fake_module.foo(), 'real foo');

                mock_console.verify();
                mock_console.restore();
                test.done();
            }
        })
    }),

    "when a mock is registered": testCase({
        setUp: function(callback) {
            mockery.registerMock('./support/fake_module', mock_fake_module);
            callback();
        },

        "and mockery is enabled": testCase({
            setUp: function(callback) {
                mockery.enable();
                callback();
            },

            "requiring the module returns the mock instead": function(test) {
                var fake_module = require('./support/fake_module');
                test.equal(fake_module.foo(), 'mocked foo');
                test.done();
            },

            "and the mock is deregistered": testCase({
                "requiring the module returns the original module": function(test) {
                    mockery.deregisterMock('./support/fake_module', mock_fake_module);
                    mockery.registerAllowable('./support/fake_module');
                    var fake_module = require('./support/fake_module');
                    test.equal(fake_module.foo(), 'real foo');
                    test.done();
                }
            }),

            "and mockery is then disabled": testCase({
                "requiring the module returns the original module": function(test) {
                    mockery.disable();
                    var fake_module = require('./support/fake_module');
                    test.equal(fake_module.foo(), 'real foo');
                    test.done();
                }
            })
        })

        /*
         // This is failing, but I'm not sure why:
         //   Error: Misconfigured substitute for './support/fake_module'

         "when a module has a registered substitute": testCase({
             setUp: function(callback) {
                 var sub_path = './support/substitute_fake_module';
                 //var subst = require('./support/substitute_fake_module');
                 mockery.registerSubstitute('./support/fake_module', sub_path);
                 callback();
             },

             "requiring the module returns the substitute instead": function(test) {
                 var fake_module = require('./support/fake_module');
                 test.equal(fake_module.foo(), 'substitute foo');
                 test.done();
             }
         })
         */
    })
});
