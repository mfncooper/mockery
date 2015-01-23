var vows = require('vows'),
    assert = require('assert'),
    mockery = require('../mockery'),
    sinon = require('sinon');

var mock_fake_module = {
    foo: function () {
        return 'mocked foo';
    }
};


var tests = {
    "when a mock is registered": {
        topic: function () {
            mockery.registerMock('./fixtures/fake_module', mock_fake_module);
            mockery.enable();
            return null;
        },
        "requiring the module returns the mock instead": function () {
            var fake_module = require('./fixtures/fake_module');
            assert.equal(fake_module.foo(), 'mocked foo');
        },
        "requiring the module returns the original module": function () {
            mockery.deregisterMock('not-a-mock', mock_fake_module);
            mockery.deregisterMock('./fixtures/fake_module', mock_fake_module);
            mockery.registerAllowable('./fixtures/fake_module');
            var fake_module = require('./fixtures/fake_module');
            assert.equal(fake_module.foo(), 'real foo');
        },
        "and mockery is then disabled requiring the module returns the original module": function () {
            mockery.disable();
            var fake_module = require('./fixtures/fake_module');
            assert.equal(fake_module.foo(), 'real foo');
        }
    }
};

vows.describe('registered').addBatch(tests).export(module);
