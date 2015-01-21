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
    "warnings are disabled": {
        topic: function () {
            mockery.enable();
            mockery.warnOnReplace(false);
            return null;
        },
        "registering a replacement causes no warning to be logged": function() {
            var mock_console;

            mock_console = sinon.mock(console);
            mock_console.expects('warn').never();

            mockery.registerMock('./fixtures/fake_module', mock_fake_module);

            mock_console.verify();
            mock_console.restore();
        },
        "and warnings are reenabled": {
            topic: function () {
                mockery.warnOnReplace(true);
                return null;
            },
            "registering a replacement causes a warning to be logged": function () {
                var mock_console;

                mock_console = sinon.mock(console);
                mock_console.expects('warn').once();

                mockery.registerMock('./fixtures/fake_module', mock_fake_module);

                mock_console.verify();
                mock_console.restore();
            }
        }
    }
};

vows.describe('warn-replace').addBatch(tests).export(module);

