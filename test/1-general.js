/*
This file named 1-general.js for a reason, it is so this
test is executed first so we can catch the "warmup" of the
module and test the dead code cases.
*/
var vows = require('vows'),
    assert = require('assert'),
    m = require('module'),
    mockery = require('../mockery');

var tests = {
    'disable before enable': {
        topic: function() {
            mockery.disable();
            return null;
        },
        'should not throw and this passes': function() {
            assert.ok(true);
        },
        'and without a module loader': {
            topic: function() {
                m.__load = m._load;
                m._load = null;
                return m;
            },
            'should throw on enable': function(m) {
                assert.throws(function() {
                    mockery.enable();
                    mockery.registerMock('fs', {});
                    require('fs');
                }, /Loader has not been hooked/);
            },
            teardown: function() {
                m._load = m.__load;
                delete m.__load;
            }
        }
    }
};

vows.describe('mockery').addBatch(tests).export(module);
