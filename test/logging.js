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
        "requiring a module causes a warning to be logged": function () {
            var mock_console, fake_module;

            mock_console = sinon.mock(console);
            mock_console.expects('warn').once();

            fake_module = require('./fixtures/fake_module');
            assert.equal(fake_module.foo(), 'real foo');

            mock_console.verify();
            mock_console.restore();
        },
        "and warnings are disabled": {
            topic: function () {
                mockery.warnOnUnregistered(false);
                return null;
            },

            "requiring a module causes no warning to be logged": function (test) {
                var mock_console, fake_module;

                mock_console = sinon.mock(console);
                mock_console.expects('warn').never();

                fake_module = require('./fixtures/fake_module');
                assert.equal(fake_module.foo(), 'real foo');

                mock_console.verify();
                mock_console.restore();
            },
            "and warnings are reenabled": {
                topic: function (callback) {
                    mockery.warnOnUnregistered(true);
                    return null;
                },

                "requiring a module causes a warning to be logged": function () {
                    var mock_console, fake_module;

                    mock_console = sinon.mock(console);
                    mock_console.expects('warn').once();

                    fake_module = require('./fixtures/fake_module');
                    assert.equal(fake_module.foo(), 'real foo');

                    mock_console.verify();
                    mock_console.restore();
                }
            }
        }
    }
};

vows.describe('logging').addBatch(tests).export(module);
