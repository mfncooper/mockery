var vows = require('vows'),
    assert = require('assert'),
    mockery = require('../mockery'),
    sinon = require('sinon');

var tests = {
    "when an array of allowables is registered": {
        setup: function () {
            mockery.registerAllowables(
                ['./fixtures/fake_module', './fixtures/fake_module_2']
            );
        },
        "and mockery is enabled": {
            topic: function () {
                mockery.enable();
                return null;
            },
            "requiring the modules causes no warning to be logged": function () {
                var mock_console, fake_module, fake_module_2;

                mock_console = sinon.mock(console);
                mock_console.expects('warn').never();

                fake_module = require('./fixtures/fake_module');
                assert.equal(fake_module.foo(), 'real foo');

                fake_module_2 = require('./fixtures/fake_module_2');
                assert.equal(fake_module_2.bar(), 'real bar');

                mock_console.verify();
                mock_console.restore();
            },
            "and the allowables are deregistered": {
                topic: function () {
                    mockery.deregisterAllowables(
                        ['./fixtures/fake_module', './fixtures/fake_module_2']
                    );
                    return null;
                },
                "requiring the modules causes warnings to be logged": function () {
                    var mock_console, fake_module, fake_module_2;

                    mock_console = sinon.mock(console);
                    mock_console.expects('warn').twice();

                    fake_module = require('./fixtures/fake_module');
                    assert.equal(fake_module.foo(), 'real foo');

                    fake_module_2 = require('./fixtures/fake_module_2');
                    assert.equal(fake_module_2.bar(), 'real bar');

                    mock_console.verify();
                    mock_console.restore();
                }
            }
        }
    }
};

vows.describe('logging-allowable-array').addBatch(tests).export(module);

