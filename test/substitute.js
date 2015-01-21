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
    "when a substitute is registered": {
        setup: function () {
            mockery.registerSubstitute('./fixtures/fake_module',
                './fixtures/substitute_fake_module');
        },
        teardown: function () {
            mockery.deregisterSubstitute('not-registered-mock');
            mockery.deregisterSubstitute('./fixtures/fake_module');
        },
        "and mockery is enabled": {
            topic: function () {
                mockery.enable();
                return null;
            },
            "requiring the module returns the substitute instead": function () {
                var fake_module = require('./fixtures/fake_module');
                assert.equal(fake_module.foo(), 'substitute foo');
            },
            "throws on an invalid module": function() {
                assert.throws(function() {
                    mockery.registerSubstitute('fs', 'does-not-exist-fs');
                    require('fs');
                }, /Cannot find module/);
            },
            "throws on an invalid substitute module": function() {
                assert.throws(function() {
                    mockery.registerSubstitute('fs');
                    require('fs');
                }, /Misconfigured substitute for/);
            },
            "registering a replacement causes a warning to be logged": function () {
                var mock_console;

                mock_console = sinon.mock(console);
                mock_console.expects('warn').once();

                mockery.registerSubstitute('./fixtures/fake_module',
                    './fixtures/substitute_fake_module');

                mock_console.verify();
                mock_console.restore();
            },
            "and warnings are disabled": {
                topic: function () {
                    mockery.warnOnReplace(false);
                    return null;
                },
                "registering a replacement causes no warning to be logged": function () {
                    var mock_console;

                    mock_console = sinon.mock(console);
                    mock_console.expects('warn').never();

                    mockery.registerSubstitute('./fixtures/fake_module',
                        './fixtures/substitute_fake_module');

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

                        mockery.registerSubstitute('./fixtures/fake_module',
                            './fixtures/substitute_fake_module');

                        mock_console.verify();
                        mock_console.restore();
                    }
                }
            }
        }
    }
};

vows.describe('substitute').addBatch(tests).export(module);

