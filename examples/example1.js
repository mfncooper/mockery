/*
 Copyrights for code authored by Yahoo! Inc. is licensed under the following
 terms:

 MIT License

 Copyright (c) 2012 Yahoo! Inc. All Rights Reserved.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to
 deal in the Software without restriction, including without limitation the
 rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 DEALINGS IN THE SOFTWARE.
*/

/*
 * This example demonstrates the use of Mockery to allow a mock to be used even
 * when its requiring module has already been loaded and cached by Node. We do
 * not use a test framework in this example, so that we control the sequence of
 * calls to our "tests". This lets us show that tests using the original module
 * dependencies can run before and / or after tests using our mock, without any
 * interference in either direction.
 *
 * Notes:
 * 1. If you change useCleanCache to 'false' in the mock test, that test will
 *    fail, because the module to be mocked was already cached by the previous
 *    test.
 * 2. If, in addition to the above, you remove the call to the real test before
 *    the call to the mock test, the mock test will succeed but the second real
 *    test will fail, because the mock is now cached by Node.
 * 3. If, in addition to both of the above, you amend the registration of the
 *    module under test to ask that it be unhooked, the remaining tests will
 *    pass, because Node will reload that module for the third test.
 * 4. The 'useCleanCache' option is useful in particular because it avoids the
 *    complexities inherent in the above combinations, and lets your tests run
 *    in any order without the risk of cross-test interference.
 */

"use strict";

var assert = require('assert'),
    mockery = require('../mockery'),
    moduleUnderTest = '../test/fixtures/intermediary';

// This is the mock we will use to replace the functionality of 'fake_module',
// which is used by 'intermediary'.
var mock_fake_module = {
    foo: function () {
        return 'mocked foo';
    }
};

/*
 * Here we test 'intermediary' in its original state, without using any mocks.
 * Thus the original 'fake_module' will be loaded and used by 'intermediary'.
 */
function testWithRealFoo() {
    var intermediary = require(moduleUnderTest),
        result = intermediary.bar();
    console.log("testWithRealFoo: " + result);
    assert.equal(result, "real foo");
}

/*
 * Here we test 'intermediary' while mocking its dependency, 'fake_module'. Our
 * mock provides different results, so that we can verify the test.
 *
 * Note that when a test framework is being used, it would be typical for (some
 * of) the Mockery calls to be placed in setUp() and tearDown() functions.
 */
function testWithMockFoo() {
    // Register the module under test (i.e. 'intermediary') as an allowable
    // module, so that mockery won't complain about it being loaded.
    mockery.registerAllowable(moduleUnderTest);
    // Register our mock for 'fake_module', using the path that 'intermediary'
    // will use to 'require' it. This tells mockery to provide our mock any
    // time this path is passed to 'require'.
    mockery.registerMock('./fake_module', mock_fake_module);
    // Enable mockery and tell it to use a clean cache. By using a clean cache,
    // Node will reload 'intermediary', causing it in turn to re-require its
    // 'fake_module' dependency, at which point mockery will provide our mock.
    // Without the clean cache, 'intermediary' will not be reloaded, because
    // Node knows it is already loaded (and cached). This means that mockery
    // has no opportunity to provide the mock, since 'fake_module' was already
    // loaded by 'intermediary' and will not be re-required.
    mockery.enable({ useCleanCache: true });

    var intermediary = require(moduleUnderTest),
        result = intermediary.bar();
    console.log("testWithMockFoo: " + result);
    assert.equal(result, "mocked foo");

    // Now that we're done with our test, we need to disable mockery so that it
    // doesn't continue intercepting 'require' calls from, for example, a test
    // framework.
    mockery.disable();
    // Finally, we clean up by deregistering the mock and allowable that we
    // registered at the beginning of the test.
    mockery.deregisterAll();
}

// Mainline code
//
// We run a test using the original modules first, which causes Node to load
// and cache all of the modules. Then we run a test using a mock, showing that
// it is provided even though the original was cached. Finally, we re-run the
// test using the original modules, showing that everything was unhooked after
// the previous test.
testWithRealFoo();
testWithMockFoo();
testWithRealFoo();
