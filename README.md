# Mockery - Simplifying the use of mocks with Node.js

If you've tried working with mocks in Node.js, you've no doubt discovered that
it's not so easy to get your mocks hooked up in the face of Node's module
loading system. When your source-under-test pulls in its dependencies through
`require`, you want your mocks provided, instead of the original module,
to enable true unit testing of your code.

This is exactly the problem Mockery is designed to solve. Mockery gives you a
simple and easy to use API with which you can hook in your mocks without having
to get your hands dirty with the `require` cache or other Node implementation
details.

Mockery is *not* a mocking framework. It lets you work more easily with your
framework of choice (or no framework) to get your mocks hooked in to all the
right places in the code you need to test.

## Installation

Just use npm:

    npm install mockery

## Enabling mockery

When enabled, Mockery intercepts *all* `require` calls, regardless of where
those calls are being made from. Thus it's almost always desirable to bracket
your usage as narrowly as possible.

If you're using a typical unit testing framework, you might enable and disable
Mockery in the test setup and teardown functions for your test cases. Something
like this:

    setUp: function() {
        mockery.enable();
    },
    tearDown: function() {
        mockery.disable();
    }

## Registering mocks

You register your mocks with Mockery to tell it which mocks to provide for which
`require` calls. For example:

    var fsMock = {
        stat: function (path, cb) { /* your mock code */ }
    };
    mockery.registerMock('fs', fsMock);

The arguments to `registerMock` are as follows:

* _module_, the name or path of the module for which a mock is being
registered. This must exactly match the argument to `require`; there is no
"clever" matching.
* _mock_, the mock to be provided. Whatever is provided here is what will
become the result of subsequent `require` calls; that is, the `exports` of the
module.

If you no longer want your mock to be used, you can deregister it:

    mockery.deregisterMock('fs');

Now the original module will be provided for any subsequent `require` calls.

## Registering substitutes

Sometimes you want to implement your mock itself as a module, especially if it's
more complicated and you'll be reusing it more widely. In that case, you can
tell Mockery to substitute that module for the original one. For example:

    mockery.registerSubstitute('fs', 'fs-mock');

Now any `require` invocation for 'fs' will be satisfied by loading the 'fs-mock'
module instead.

The arguments to `registerSubstitute` are as follows:

* _module_, the name or path of the module for which a substitute is being
registered. This must exactly match the argument to `require`; there is no
"clever" matching.
* _substitute_, the name or path of the module to substitute for _module_.

If you no longer want your substitute to be used, you can deregister it:

    mockery.deregisterSubstitute('fs');

Now the original module will be provided for any subsequent `require` calls.

## Registering allowable modules

If you enable Mockery and _don't_ mock or substitute a module that is later
loaded via `require`, Mockery will print a warning to the console to tell you
that. This is so that you don't inadvertently use downstream modules without
being aware of them. By registering a module as "allowable", you tell Mockery
that you know about its use, and then Mockery won't print the warning.

The most common use case for this is your source-under-test, which obviously
you'll want to load without warnings. For example:

    mockery.registerAllowable('./my-source-under-test');

As with `registerMock` and `registerSubstitute`, the first argument, _module_,
is the name or path of the module as it would be provided to `require`. Once
again, you can deregister it if you need to:

    mockery.deregisterAllowable('./my-source-under-test');

### Unhooking

By default, the Node module loader will load a given module only once, caching
the loaded module for the lifetime of the process. When you're using Mockery,
this is almost always what you want. _Almost_. In relatively rare situations,
you may find that you need to use different mocks for different test cases
for the same source-under-test. (This is not the same as supplying different
test data in the same mock; here we're talking about providing different
functions for a module's `exports`.)

To do this, your source-under-test must be unhooked from Node's module loading
system, such that it can be loaded again with new mocks. You do this by passing
a second argument, _unhook_, to `registerAllowable`, like this:

    mockery.registerAllowable('./my-source-under-test', true);

When you subsequently deregister your source-under-test, Mockery will unhook it
from the Node module loading system as well as deregistering it.

## Deregistering everything

Since it's such a common use case, especially when you're using a unit test
framework and its setup and teardown functions, Mockery provides a convenience
function to deregister everything:

    mockery.deregisterAll();

This will deregister all mocks, substitutes, and allowable modules, as well as
unhooking any hooked modules.

## The name

Mockery is to mocks as rookery is to rooks.

## License

Mockery is licensed under the [MIT License](http://github.com/mfncooper/mockery/raw/master/LICENSE).
