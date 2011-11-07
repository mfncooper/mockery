var testCase = require('nodeunit').testCase;
var mockery = require('../mockery');
var sinon = require('sinon');

module.exports = testCase({
    setUp: function(callback) {
        callback();
    },
        
    tearDown: function (callback) {
        mockery.disable();
        mockery.deregisterAll();
        callback();
    },

    "registerMock": testCase({
        "module not yet registered": testCase({
            "adds module path to registeredMocks": function(test) {
                var mock_foo = {'fake': 'foo'};
                mockery.registerMock('./fake_module', mock_foo);
                test.deepEqual(mockery.getRegisteredMocks()['./fake_module'], mock_foo);
                test.done();
            }
        }),

        "module already registered": testCase({
            "adds module path to registeredMocks, logs warning": function(test) {
                var mock_foo = {'fake': 'foo'};
                mockery.registerMock('./fake_module', mock_foo);

                var mock_console = sinon.mock(console);
                mock_console.expects('warn').once();

                mockery.registerMock('./fake_module', mock_foo);

                mock_console.verify();
                mock_console.restore();
                test.deepEqual(mockery.getRegisteredMocks()['./fake_module'], mock_foo);
                test.done();
            }
        })
    }),

    "deregisterMock": testCase({
        "removes module from registeredMocks": function(test) {
            var mock_foo = {'fake': 'foo'};
            mockery.registerMock('./fake_module', mock_foo);
            mockery.deregisterMock('./fake_module');
            test.equal(typeof mockery.getRegisteredMocks()['./fake_module'], 'undefined');
            test.done();
        }
    }),

    "registerSubstitute": testCase({
        "module not yet registered": testCase({
            "adds module path to registeredSubstitutes": function(test) {
                var substitute_path = './fake_module_sub';
                mockery.registerSubstitute('./fake_module', substitute_path);
                test.deepEqual(mockery.getRegisteredSubstitutes()['./fake_module'], substitute_path);
                test.done();
            }
        }),

        "module already registered": testCase({
            "adds module path to registeredSubstitutes, logs warning": function(test) {
                var substitute_path = './fake_module_sub';
                mockery.registerSubstitute('./fake_module', substitute_path);

                var mock_console = sinon.mock(console);
                mock_console.expects('warn').once();

                mockery.registerSubstitute('./fake_module', substitute_path);

                mock_console.verify();
                mock_console.restore();
                test.deepEqual(mockery.getRegisteredSubstitutes()['./fake_module'], substitute_path);
                test.done();
            }
        })
    }),

    "deregisterSubstitute": testCase({
        "removes module from registeredSubstitutes": function(test) {
            var substitute_path = './fake_module_sub';
            mockery.registerSubstitute('./fake_module', substitute_path);
            mockery.deregisterSubstitute('./fake_module');
            test.equal(typeof mockery.getRegisteredSubstitutes()['./fake_module'], 'undefined');
            test.done();
        }
    })
});
