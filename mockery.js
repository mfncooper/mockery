/*
 Copyrights for code authored by Yahoo! Inc. is licensed under the following
 terms:

 MIT License

 Copyright (c) 2011-2012 Yahoo! Inc. All Rights Reserved.

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
 * A library that enables the hooking of the standard 'require' function, such
 * that a (possibly partial) mock implementation can be provided instead. This
 * is most useful for running unit tests, since any dependency obtained through
 * 'require' can be mocked out.
 */

"use strict";

var defaultOptions = {
        useCleanCache: false,
        warnOnReplace: true,
        warnOnUnregistered: true
    };

function Mockery(){
    this.m = require('module');
    this.registeredMocks = {};
    this.registeredSubstitutes = {};
    this.registeredAllowables = {};
    this.originalLoader = null;
    this.originalCache = null;
    this.options = {};
}

/*
 * Merge the supplied options in with a new copy of the default options to get
 * the effective options, and return those.
 */
Mockery.prototype.getEffectiveOptions = function (opts) {
    var options = {};

    Object.keys(defaultOptions).forEach(function (key) {
        options[key] = defaultOptions[key];
    });
    if (opts) {
        Object.keys(opts).forEach(function (key) {
            options[key] = opts[key];
        });
    }
    return options;
};

/*
 * The perils of using internal functions. The Node-internal _resolveFilename
 * function was changed in commit 840229a8251955d2b791928875f36d35127dcad0
 * (just prior to v0.6.10) such that it returns a string, whereas previously
 * it returned an array. Instead of playing version number tricks, just check
 * for an array and pull the filename from that if necessary.
 */
Mockery.prototype.resolveFilename = function (request, parent) {
    var filename = this.m._resolveFilename(request, parent);
    if (Array.isArray(filename)) {
        filename = filename[1];
    }
    return filename;
};

/*
 * The (private) loader replacement that is used when hooking is enabled. It
 * does the work of returning a mock or substitute when configured, reporting
 * non-allowed modules, and invoking the original loader when appropriate.
 * The signature of this function *must* match that of Node's Module._load,
 * since it will replace that when mockery is enabled.
 */
 function hookedLoader(request, parent, isMain) {
    var subst, allow, file;
    if (!this.originalLoader) {
        throw new Error('Loader has not been hooked');
    }

    if (this.registeredMocks.hasOwnProperty(request)) {
        return this.registeredMocks[request];
    }

    if (this.registeredSubstitutes.hasOwnProperty(request)) {
        subst = this.registeredSubstitutes[request];
        if (!subst.module && subst.name) {
            subst.module = this.originalLoader(subst.name, parent, isMain);
        }
        if (!subst.module) {
            throw new Error('Misconfigured substitute for "' + request + '"');
        }
        return subst.module;
    }

    if (this.registeredAllowables.hasOwnProperty(request)) {
        allow = this.registeredAllowables[request];
        if (allow.unhook) {
            file = this.resolveFilename(request, parent);
            if (file.indexOf('/') !== -1 && allow.paths.indexOf(file) === -1) {
                allow.paths.push(file);
            }
        }
    } else {
        if (this.options.warnOnUnregistered) {
            console.warn('WARNING: loading non-allowed module: ' + request);
        }
    }

    return this.originalLoader(request, parent, isMain);
}

/*
 * Enables mockery by hooking subsequent 'require' invocations. Note that *all*
 * 'require' invocations will be hooked until 'disable' is called. Calling this
 * function more than once will have no ill effects.
 */
Mockery.prototype.enable = function (opts) {
    if (this.originalLoader) {
        // Already hooked
        return;
    }

    this.options = this.getEffectiveOptions(opts);

    if (this.options.useCleanCache) {
        this.originalCache = this.m._cache;
        this.m._cache = {};
    }

    this.originalLoader = this.m._load;
    this.m._load = hookedLoader.bind(this);
};

/*
 * Disables mockery by unhooking from the Node loader. No subsequent 'require'
 * invocations will be seen by mockery. Calling this function more than once
 * will have no ill effects.
 */
Mockery.prototype.disable = function () {
    if (!this.originalLoader) {
        // Not hooked
        return;
    }

    if (this.options.useCleanCache) {
        this.m._cache = this.originalCache;
        this.originalCache = null;
    }

    this.m._load = this.originalLoader;
    this.originalLoader = null;
};

 /*
 * If the clean cache option is in effect, reset the module cache to an empty
 * state. Calling this function when the clean cache option is not in effect
 * will have no ill effects, but will do nothing.
 */
Mockery.prototype.resetCache = function () {
    if (this.options.useCleanCache && this.originalCache) {
        this.m._cache = {};
    }
};

/*
 * Enable or disable warnings to the console when previously registered mocks
 * and subsitutes are replaced.
 */
Mockery.prototype.warnOnReplace = function (enable) {
    this.options.warnOnReplace = enable;
};

/*
 * Enable or disable warnings to the console when modules are loaded that have
 * not been registered as a mock, a substitute, or allowed.
 */
Mockery.prototype.warnOnUnregistered = function (enable) {
    this.options.warnOnUnregistered = enable;
};

/*
 * Register a mock object for the specified module. While mockery is enabled,
 * any subsequent 'require' for this module will return the mock object. The
 * mock need not mock out all original exports, but no fallback is provided
 * for anything not mocked and subsequently invoked.
 */
Mockery.prototype.registerMock = function (mod, mock) {
    if (this.options.warnOnReplace && this.registeredMocks.hasOwnProperty(mod)) {
        console.warn('WARNING: Replacing existing mock for module: ' + mod);
    }
    this.registeredMocks[mod] = mock;
};

/*
 * Deregister a mock object for the specified module. A subsequent 'require' for
 * that module will revert to the previous behaviour (which, by default, means
 * falling back to the original 'require' behaviour).
 */
Mockery.prototype.deregisterMock = function (mod) {
    if (this.registeredMocks.hasOwnProperty(mod)) {
        delete this.registeredMocks[mod];
    }
};

/*
 * Register a substitute module for the specified module. While mockery is
 * enabled, any subsequent 'require' for this module will be effectively
 * replaced by a 'require' for the substitute module. This is useful when
 * a mock implementation is itself implemented as a module.
 */
Mockery.prototype.registerSubstitute = function (mod, subst) {
    if (this.options.warnOnReplace && this.registeredSubstitutes.hasOwnProperty(mod)) {
        console.warn('WARNING: Replacing existing substitute for module: ' + mod);
    }
    this.registeredSubstitutes[mod] = {
        name: subst
    };
};

/*
 * Deregister a substitute module for the specified module. A subsequent
 * 'require' for that module will revert to the previous behaviour (which, by
 * default, means falling back to the original 'require' behaviour).
 */
Mockery.prototype.deregisterSubstitute = function (mod) {
    if (this.registeredSubstitutes.hasOwnProperty(mod)) {
        delete this.registeredSubstitutes[mod];
    }
};

/*
 * Register a module as 'allowed', meaning that, even if a mock or substitute
 * for it has not been registered, mockery will not complain when it is loaded
 * via 'require'. This encourages the user to consciously declare the modules
 * that will be loaded and used in the original form, thus avoiding warnings.
 *
 * If 'unhook' is true, the module will be removed from the module cache when
 * it is deregistered.
 */
Mockery.prototype.registerAllowable = function (mod, unhook) {
    this.registeredAllowables[mod] = {
        unhook: !!unhook,
        paths: []
    };
};

/*
 * Register an array of modules as 'allowed'. This is a convenience function
 * that performs the same function as 'registerAllowable' but for an array of
 * modules rather than a single module.
 */
Mockery.prototype.registerAllowables = function (mods, unhook) {
    var mockery = this;

    mods.forEach(function (mod) {
        mockery.registerAllowable(mod, unhook);
    });
};

/*

 * Deregister a module as 'allowed'. A subsequent 'require' for that module
 * will generate a warning that the module is not allowed, unless or until a
 * mock or substitute is registered for that module.
 */
Mockery.prototype.deregisterAllowable = function (mod) {
    var mockery = this;

    if (this.registeredAllowables.hasOwnProperty(mod)) {
        var allow = this.registeredAllowables[mod];
        if (allow.unhook) {
            allow.paths.forEach(function (p) {
                delete mockery.m._cache[p];
            });
        }
        delete this.registeredAllowables[mod];
    }
};

/*
 * Deregister an array of modules as 'allowed'. This is a convenience function
 * that performs the same function as 'deregisterAllowable' but for an array of
 * modules rather than a single module.
 */
Mockery.prototype.deregisterAllowables = function (mods) {
    var mockery = this;

    mods.forEach(function (mod) {
        mockery.deregisterAllowable(mod);
    });
};

/*
 * Deregister all mocks, substitutes, and allowed modules, resetting the state
 * to a clean slate. This does not affect the enabled / disabled state of
 * mockery, though.
 */
Mockery.prototype.deregisterAll = function () {
    var mockery = this;

    Object.keys(this.registeredAllowables).forEach(function (mod) {
        var allow = mockery.registeredAllowables[mod];
        if (allow.unhook) {
            allow.paths.forEach(function (p) {
                delete mockery.m._cache[p];
            });
        }
    });

    this.registeredMocks = {};
    this.registeredSubstitutes = {};
    this.registeredAllowables = {};
};

// Dodgey way of making the constructor an instance of itself to not break backwards compatability
var instance = new Mockery();
for(var key in instance){
    var property = instance[key];
    if(typeof property === 'function'){
        property = property.bind(instance);
    }
    Mockery[key] = property;
}

module.exports = Mockery;


