var vows = require('vows'),
    assert = require('assert'),
    mockery = require('../mockery'),
    sinon = require('sinon');

var tests = {
    "when an allowable is registered": {
        setup: function () {
            mockery.registerAllowable('./fixtures/fake_module');
        },

        "and mockery is enabled": {
            topic: function () {
                mockery.enable();
                return null;
            },

            "requiring the module causes no warning to be logged": function () {
                var mock_console, fake_module;

                mock_console = sinon.mock(console);
                mock_console.expects('warn').never();

                fake_module = require('./fixtures/fake_module');
                assert.equal(fake_module.foo(), 'real foo');

                mock_console.verify();
                mock_console.restore();
            },
            "requiring the module which is allowed via regexp causes no warning to be logged": function () {
                var mock_console, fake_module;

                mock_console = sinon.mock(console);
                mock_console.expects('warn').never();

                mockery.registerAllowableRegExp(/.+\$\.object-assign/ig);
                fake_module = require('./fixtures/$.object-assign');
                assert.equal(fake_module.foo(), 'object assign');

                mock_console.verify();
                mock_console.restore();
            },
            "and the allowable is deregistered": {
                topic: function () {
                    mockery.deregisterAllowable('./fixtures/fake_module');
                    return null;
                },
                "requiring the module causes a warning to be logged": function () {
                    var mock_console, fake_module;

                    mock_console = sinon.mock(console);
                    mock_console.expects('warn').once();

                    fake_module = require('./fixtures/fake_module');
                    assert.equal(fake_module.foo(), 'real foo');

                    mock_console.verify();
                    mock_console.restore();
                },
                "requiring the module which is allowed via regexp causes a warning to be logged": function () {
                    var mock_console, fake_module;

                    mockery.deregisterAllowableRegExp(/.+\$\.object-assign/ig);

                    mock_console = sinon.mock(console);
                    mock_console.expects('warn').once();

                    fake_module = require('./fixtures/$.object-assign');
                    assert.equal(fake_module.foo(), 'object assign');

                    mock_console.verify();
                    mock_console.restore();
                }
            }
        }
    }
};

vows.describe('logging-allowable').addBatch(tests).export(module);
