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
    "when an intermediary module is involved": {
        topic: function() {
            return null;
        },
        "and mockery is not enabled requiring the intermediary causes the original to be used": function () {
            var intermediary = require('./fixtures/intermediary');
            assert.equal(intermediary.bar(), 'real foo');
        },
        "and mockery is enabled without the clean cache option": {
            topic: function () {
                mockery.registerMock('./fake_module', mock_fake_module);
                mockery.registerAllowable('./fixtures/intermediary');
                mockery.enable({ useCleanCache: false });
                var i = require('./fixtures/intermediary');
                mockery.resetCache();
                mockery.disable();
                return i;
            },
            "requiring the intermediary causes the original to be used": function (intermediary) {
                assert.equal(intermediary.bar(), 'real foo');
            },
            "then mockery is enabled with the clean cache option": {
                topic: function () {
                    mockery.registerMock('./fake_module', mock_fake_module);
                    mockery.registerAllowable('./fixtures/intermediary');
                    mockery.enable({ useCleanCache: true });
                    var i = require('./fixtures/intermediary');
                    mockery.resetCache();
                    return i;
                },
                "requiring the intermediary causes the mock to be used": function (intermediary) {
                    assert.equal(intermediary.bar(), 'mocked foo');
                },
                "then mockery is disabled": {
                    topic: function() {
                        mockery.disable();
                        return require('./fixtures/intermediary');
                    },
                    "requiring the intermediary causes the original to be used": function (intermediary) {
                        assert.equal(intermediary.bar(), 'real foo');
                    }
                }
            }
        }
    }
};

vows.describe('intermediary').addBatch(tests).export(module);

