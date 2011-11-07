/*
 * Run with nodeunit:
 *   nodeunit --reporter nested mockery.unit.js
 */
var testCase = require('nodeunit').testCase;
var mockery = require('../mockery');
var sinon = require('sinon');

module.exports = testCase({
    tearDown: function (callback) {
        mockery.disable();
        mockery.deregisterAll();
        callback();
    },

    "registerMock": testCase({
        "module not yet registered": testCase({
            "adds module path to registeredMocks": function(test) {
                var mock_foo = {'fake': 'foo'};
                mockery.registerMock('./support/fake_module', mock_foo);
                test.deepEqual(mockery.getRegisteredMocks()['./support/fake_module'], mock_foo);
                test.done();
            }
        }),

        "module already registered": testCase({
            "adds module path to registeredMocks, logs warning": function(test) {
                var mock_foo = {'fake': 'foo'};
                mockery.registerMock('./support/fake_module', mock_foo);

                var mock_console = sinon.mock(console);
                mock_console.expects('warn').once();

                mockery.registerMock('./support/fake_module', mock_foo);

                mock_console.verify();
                mock_console.restore();
                test.deepEqual(mockery.getRegisteredMocks()['./support/fake_module'], mock_foo);
                test.done();
            }
        })
    }),

    "deregisterMock": testCase({
        "removes module from registeredMocks": function(test) {
            var mock_foo = {'fake': 'foo'};
            mockery.registerMock('./support/fake_module', mock_foo);
            mockery.deregisterMock('./support/fake_module');
            test.equal(typeof mockery.getRegisteredMocks()['./support/fake_module'], 'undefined');
            test.done();
        }
    }),

    "registerSubstitute": testCase({
        "module not yet registered": testCase({
            "adds module path to registeredSubstitutes": function(test) {
                var substitute_path = './support/fake_module_sub';
                mockery.registerSubstitute('./support/fake_module', substitute_path);
                test.deepEqual(mockery.getRegisteredSubstitutes()['./support/fake_module'], substitute_path);
                test.done();
            }
        }),

        "module already registered": testCase({
            "adds module path to registeredSubstitutes, logs warning": function(test) {
                var substitute_path = './support/fake_module_sub';
                mockery.registerSubstitute('./support/fake_module', substitute_path);

                var mock_console = sinon.mock(console);
                mock_console.expects('warn').once();

                mockery.registerSubstitute('./support/fake_module', substitute_path);

                mock_console.verify();
                mock_console.restore();
                test.deepEqual(mockery.getRegisteredSubstitutes()['./support/fake_module'], substitute_path);
                test.done();
            }
        })
    }),

    "deregisterSubstitute": testCase({
        "removes module from registeredSubstitutes": function(test) {
            var substitute_path = './support/fake_module_sub';
            mockery.registerSubstitute('./support/fake_module', substitute_path);
            mockery.deregisterSubstitute('./support/fake_module');
            test.equal(typeof mockery.getRegisteredSubstitutes()['./support/fake_module'], 'undefined');
            test.done();
        }
    }),

    "registerAllowable": testCase({
        "without unhook param": testCase({
            "adds module to registeredAllowables, sets unhook to false": function(test) {
                mockery.registerAllowable('./support/fake_module');
                test.deepEqual(mockery.getRegisteredAllowables()['./support/fake_module'], {unhook: false, paths: []});
                test.done();
            }
        }),

        "with unhook param": testCase({
            "adds module to registeredAllowables, sets unhook to true": function(test) {
                mockery.registerAllowable('./support/fake_module', true);
                test.deepEqual(mockery.getRegisteredAllowables()['./support/fake_module'], {unhook: true, paths: []});
                test.done();
            }
        })
    }),

    "deregisterAllowable": testCase({
        "removes module from registeredAllowables": function(test) {
            mockery.registerAllowable('./support/fake_module');
            mockery.deregisterAllowable('./support/fake_module');
            test.equal(typeof mockery.getRegisteredAllowables()['./support/fake_module'], 'undefined');
            test.done();
        }
    }),

    "deregisterAll": testCase({
        setUp: function(callback) {
            var substitute_path = './support/fake_module_sub';
            var mock_foo = {'fake': 'foo'};
            mockery.registerMock('./support/fake_module', mock_foo);
            mockery.registerSubstitute('./support/fake_module', substitute_path);
            mockery.registerAllowable('./support/fake_module');

            mockery.deregisterAll('./support/fake_module');
            callback();
        },

        "removes modules from registeredMocks": function(test) {
            test.equal(typeof mockery.getRegisteredMocks()['./support/fake_module'], 'undefined');
            test.done();
        },

        "removes modules from registeredSubstitutes": function(test) {
            test.equal(typeof mockery.getRegisteredSubstitutes()['./support/fake_module'], 'undefined');
            test.done();
        },

        "removes modules from registeredAllowables": function(test) {
            test.equal(typeof mockery.getRegisteredAllowables()['./support/fake_module'], 'undefined');
            test.done();
        }
    })
});
