(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
/*
  https://github.com/banksean wrapped Makoto Matsumoto and Takuji Nishimura's code in a namespace
  so it's better encapsulated. Now you can have multiple random number generators
  and they won't stomp all over eachother's state.

  If you want to use this as a substitute for Math.random(), use the random()
  method like so:

  var m = new MersenneTwister();
  var randomNumber = m.random();

  You can also call the other genrand_{foo}() methods on the instance.

  If you want to use a specific seed in order to get a repeatable random
  sequence, pass an integer into the constructor:

  var m = new MersenneTwister(123);

  and that will always produce the same random sequence.

  Sean McCullough (banksean@gmail.com)
*/

/*
   A C-program for MT19937, with initialization improved 2002/1/26.
   Coded by Takuji Nishimura and Makoto Matsumoto.

   Before using, initialize the state by using init_seed(seed)
   or init_by_array(init_key, key_length).

   Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
   All rights reserved.

   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions
   are met:

     1. Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.

     2. Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.

     3. The names of its contributors may not be used to endorse or promote
        products derived from this software without specific prior written
        permission.

   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
   A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


   Any feedback is very welcome.
   http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html
   email: m-mat @ math.sci.hiroshima-u.ac.jp (remove space)
*/

var MersenneTwister = function(seed) {
	if (seed == undefined) {
		seed = new Date().getTime();
	}

	/* Period parameters */
	this.N = 624;
	this.M = 397;
	this.MATRIX_A = 0x9908b0df;   /* constant vector a */
	this.UPPER_MASK = 0x80000000; /* most significant w-r bits */
	this.LOWER_MASK = 0x7fffffff; /* least significant r bits */

	this.mt = new Array(this.N); /* the array for the state vector */
	this.mti=this.N+1; /* mti==N+1 means mt[N] is not initialized */

	if (seed.constructor == Array) {
		this.init_by_array(seed, seed.length);
	}
	else {
		this.init_seed(seed);
	}
}

/* initializes mt[N] with a seed */
/* origin name init_genrand */
MersenneTwister.prototype.init_seed = function(s) {
	this.mt[0] = s >>> 0;
	for (this.mti=1; this.mti<this.N; this.mti++) {
		var s = this.mt[this.mti-1] ^ (this.mt[this.mti-1] >>> 30);
		this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253)
		+ this.mti;
		/* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
		/* In the previous versions, MSBs of the seed affect   */
		/* only MSBs of the array mt[].                        */
		/* 2002/01/09 modified by Makoto Matsumoto             */
		this.mt[this.mti] >>>= 0;
		/* for >32 bit machines */
	}
}

/* initialize by an array with array-length */
/* init_key is the array for initializing keys */
/* key_length is its length */
/* slight change for C++, 2004/2/26 */
MersenneTwister.prototype.init_by_array = function(init_key, key_length) {
	var i, j, k;
	this.init_seed(19650218);
	i=1; j=0;
	k = (this.N>key_length ? this.N : key_length);
	for (; k; k--) {
		var s = this.mt[i-1] ^ (this.mt[i-1] >>> 30)
		this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525)))
		+ init_key[j] + j; /* non linear */
		this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
		i++; j++;
		if (i>=this.N) { this.mt[0] = this.mt[this.N-1]; i=1; }
		if (j>=key_length) j=0;
	}
	for (k=this.N-1; k; k--) {
		var s = this.mt[i-1] ^ (this.mt[i-1] >>> 30);
		this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941))
		- i; /* non linear */
		this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
		i++;
		if (i>=this.N) { this.mt[0] = this.mt[this.N-1]; i=1; }
	}

	this.mt[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */
}

/* generates a random number on [0,0xffffffff]-interval */
/* origin name genrand_int32 */
MersenneTwister.prototype.random_int = function() {
	var y;
	var mag01 = new Array(0x0, this.MATRIX_A);
	/* mag01[x] = x * MATRIX_A  for x=0,1 */

	if (this.mti >= this.N) { /* generate N words at one time */
		var kk;

		if (this.mti == this.N+1)  /* if init_seed() has not been called, */
			this.init_seed(5489);  /* a default initial seed is used */

		for (kk=0;kk<this.N-this.M;kk++) {
			y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
			this.mt[kk] = this.mt[kk+this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
		}
		for (;kk<this.N-1;kk++) {
			y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
			this.mt[kk] = this.mt[kk+(this.M-this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
		}
		y = (this.mt[this.N-1]&this.UPPER_MASK)|(this.mt[0]&this.LOWER_MASK);
		this.mt[this.N-1] = this.mt[this.M-1] ^ (y >>> 1) ^ mag01[y & 0x1];

		this.mti = 0;
	}

	y = this.mt[this.mti++];

	/* Tempering */
	y ^= (y >>> 11);
	y ^= (y << 7) & 0x9d2c5680;
	y ^= (y << 15) & 0xefc60000;
	y ^= (y >>> 18);

	return y >>> 0;
}

/* generates a random number on [0,0x7fffffff]-interval */
/* origin name genrand_int31 */
MersenneTwister.prototype.random_int31 = function() {
	return (this.random_int()>>>1);
}

/* generates a random number on [0,1]-real-interval */
/* origin name genrand_real1 */
MersenneTwister.prototype.random_incl = function() {
	return this.random_int()*(1.0/4294967295.0);
	/* divided by 2^32-1 */
}

/* generates a random number on [0,1)-real-interval */
MersenneTwister.prototype.random = function() {
	return this.random_int()*(1.0/4294967296.0);
	/* divided by 2^32 */
}

/* generates a random number on (0,1)-real-interval */
/* origin name genrand_real3 */
MersenneTwister.prototype.random_excl = function() {
	return (this.random_int() + 0.5)*(1.0/4294967296.0);
	/* divided by 2^32 */
}

/* generates a random number on [0,1) with 53-bit resolution*/
/* origin name genrand_res53 */
MersenneTwister.prototype.random_long = function() {
	var a=this.random_int()>>>5, b=this.random_int()>>>6;
	return(a*67108864.0+b)*(1.0/9007199254740992.0);
}

/* These real versions are due to Isaku Wada, 2002/01/09 added */

module.exports = MersenneTwister;

},{}],3:[function(require,module,exports){
//! moment.js

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, (function () { 'use strict';

    var hookCallback;

    function hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }

    function isObject(input) {
        // IE8 will treat undefined and null as object if it wasn't for
        // input != null
        return input != null && Object.prototype.toString.call(input) === '[object Object]';
    }

    function isObjectEmpty(obj) {
        if (Object.getOwnPropertyNames) {
            return (Object.getOwnPropertyNames(obj).length === 0);
        } else {
            var k;
            for (k in obj) {
                if (obj.hasOwnProperty(k)) {
                    return false;
                }
            }
            return true;
        }
    }

    function isUndefined(input) {
        return input === void 0;
    }

    function isNumber(input) {
        return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false,
            parsedDateParts : [],
            meridiem        : null,
            rfc2822         : false,
            weekdayMismatch : false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function (fun) {
            var t = Object(this);
            var len = t.length >>> 0;

            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    function isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            var parsedParts = some.call(flags.parsedDateParts, function (i) {
                return i != null;
            });
            var isNowValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.weekdayMismatch &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated &&
                (!flags.meridiem || (flags.meridiem && parsedParts));

            if (m._strict) {
                isNowValid = isNowValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }

            if (Object.isFrozen == null || !Object.isFrozen(m)) {
                m._isValid = isNowValid;
            }
            else {
                return isNowValid;
            }
        }
        return m._isValid;
    }

    function createInvalid (flags) {
        var m = createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i = 0; i < momentProperties.length; i++) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) {
            this._d = new Date(NaN);
        }
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function warn(msg) {
        if (hooks.suppressDeprecationWarnings === false &&
                (typeof console !==  'undefined') && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [];
                var arg;
                for (var i = 0; i < arguments.length; i++) {
                    arg = '';
                    if (typeof arguments[i] === 'object') {
                        arg += '\n[' + i + '] ';
                        for (var key in arguments[0]) {
                            arg += key + ': ' + arguments[0][key] + ', ';
                        }
                        arg = arg.slice(0, -2); // Remove trailing comma and space
                    } else {
                        arg = arguments[i];
                    }
                    args.push(arg);
                }
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;

    function isFunction(input) {
        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (isFunction(prop)) {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
        // TODO: Remove "ordinalParse" fallback in next major release.
        this._dayOfMonthOrdinalParseLenient = new RegExp(
            (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
                '|' + (/\d{1,2}/).source);
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig), prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (hasOwnProp(parentConfig, prop) &&
                    !hasOwnProp(childConfig, prop) &&
                    isObject(parentConfig[prop])) {
                // make sure changes to properties don't modify parent config
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function (obj) {
            var i, res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function calendar (key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultDayOfMonthOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        ss : '%d seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (isFunction(output)) ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [];
        for (var u in unitsObj) {
            units.push({unit: u, priority: priorities[u]});
        }
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '', i;
            for (i = 0; i < length; i++) {
                output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match3to4      = /\d\d\d\d?/;     //     999 - 9999
    var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    // includes scottish gaelic two word and hyphenated months
    var matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i;

    var regexes = {};

    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (isNumber(callback)) {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? '' + y : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PRIORITIES

    addUnitPriority('year', 1);

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                set$1(this, unit, value);
                hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get(this, unit);
            }
        };
    }

    function get (mom, unit) {
        return mom.isValid() ?
            mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }

    function set$1 (mom, unit, value) {
        if (mom.isValid() && !isNaN(value)) {
            if (unit === 'FullYear' && isLeapYear(mom.year()) && mom.month() === 1 && mom.date() === 29) {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value, mom.month(), daysInMonth(value, mom.month()));
            }
            else {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
            }
        }
    }

    // MOMENTS

    function stringGet (units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }


    function stringSet (units, value) {
        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units);
            for (var i = 0; i < prioritized.length; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function mod(n, x) {
        return ((n % x) + x) % x;
    }

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (o) {
            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        if (isNaN(year) || isNaN(month)) {
            return NaN;
        }
        var modMonth = mod(month, 12);
        year += (month - modMonth) / 12;
        return modMonth === 1 ? (isLeapYear(year) ? 29 : 28) : (31 - modMonth % 7 % 2);
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PRIORITY

    addUnitPriority('month', 8);

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m, format) {
        if (!m) {
            return isArray(this._months) ? this._months :
                this._months['standalone'];
        }
        return isArray(this._months) ? this._months[m.month()] :
            this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m, format) {
        if (!m) {
            return isArray(this._monthsShort) ? this._monthsShort :
                this._monthsShort['standalone'];
        }
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
            this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function handleStrictParse(monthName, format, strict) {
        var i, ii, mom, llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (this._monthsParseExact) {
            return handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (!isNumber(value)) {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            hooks.updateOffset(this, true);
            return this;
        } else {
            return get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    var defaultMonthsShortRegex = matchWord;
    function monthsShortRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict ?
                this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }

    var defaultMonthsRegex = matchWord;
    function monthsRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict ?
                this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    }

    function createDate (y, m, d, h, M, s, ms) {
        // can't just apply() to create a date:
        // https://stackoverflow.com/q/181348
        var date;
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            date = new Date(y + 400, m, d, h, M, s, ms);
            if (isFinite(date.getFullYear())) {
                date.setFullYear(y);
            }
        } else {
            date = new Date(y, m, d, h, M, s, ms);
        }

        return date;
    }

    function createUTCDate (y) {
        var date;
        // the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            var args = Array.prototype.slice.call(arguments);
            // preserve leap years using a full 400 year cycle, then reset
            args[0] = y + 400;
            date = new Date(Date.UTC.apply(null, args));
            if (isFinite(date.getUTCFullYear())) {
                date.setUTCFullYear(y);
            }
        } else {
            date = new Date(Date.UTC.apply(null, arguments));
        }

        return date;
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear, resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek, resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PRIORITIES

    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 6th is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PRIORITY
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd',   function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd',   function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }

    // LOCALES
    function shiftWeekdays (ws, n) {
        return ws.slice(n, 7).concat(ws.slice(0, n));
    }

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m, format) {
        var weekdays = isArray(this._weekdays) ? this._weekdays :
            this._weekdays[(m && m !== true && this._weekdays.isFormat.test(format)) ? 'format' : 'standalone'];
        return (m === true) ? shiftWeekdays(weekdays, this._week.dow)
            : (m) ? weekdays[m.day()] : weekdays;
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return (m === true) ? shiftWeekdays(this._weekdaysShort, this._week.dow)
            : (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return (m === true) ? shiftWeekdays(this._weekdaysMin, this._week.dow)
            : (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }

    function handleStrictParse$1(weekdayName, format, strict) {
        var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse (weekdayName, format, strict) {
        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return handleStrictParse$1.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\\.?') + '$', 'i');
                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\\.?') + '$', 'i');
                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\\.?') + '$', 'i');
            }
            if (!this._weekdaysParse[i]) {
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.

        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }

    var defaultWeekdaysRegex = matchWord;
    function weekdaysRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict ?
                this._weekdaysStrictRegex : this._weekdaysRegex;
        }
    }

    var defaultWeekdaysShortRegex = matchWord;
    function weekdaysShortRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict ?
                this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
    }

    var defaultWeekdaysMinRegex = matchWord;
    function weekdaysMinRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict ?
                this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
    }


    function computeWeekdaysParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom, minp, shortp, longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, 1]).day(i);
            minp = this.weekdaysMin(mom, '');
            shortp = this.weekdaysShort(mom, '');
            longp = this.weekdays(mom, '');
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 7; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PRIORITY
    addUnitPriority('hour', 13);

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('k',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addRegexToken('kk', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['k', 'kk'], function (input, array, config) {
        var kInput = toInt(input);
        array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour they want. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
        relativeTime: defaultRelativeTime,

        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,

        week: defaultLocaleWeek,

        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,

        meridiemParse: defaultLocaleMeridiemParse
    };

    // internal storage for locale config files
    var locales = {};
    var localeFamilies = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return globalLocale;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && (typeof module !== 'undefined') &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                var aliasedRequire = require;
                aliasedRequire('./locale/' + name);
                getSetGlobalLocale(oldLocale);
            } catch (e) {}
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
            else {
                if ((typeof console !==  'undefined') && console.warn) {
                    //warn user if arguments are passed but the locale could not be set
                    console.warn('Locale ' + key +  ' not found. Did you forget to load it?');
                }
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, config) {
        if (config !== null) {
            var locale, parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple('defineLocaleOverride',
                        'use moment.updateLocale(localeName, config) to change ' +
                        'an existing locale. moment.defineLocale(localeName, ' +
                        'config) should only be used for creating a new locale ' +
                        'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    locale = loadLocale(config.parentLocale);
                    if (locale != null) {
                        parentConfig = locale._config;
                    } else {
                        if (!localeFamilies[config.parentLocale]) {
                            localeFamilies[config.parentLocale] = [];
                        }
                        localeFamilies[config.parentLocale].push({
                            name: name,
                            config: config
                        });
                        return null;
                    }
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));

            if (localeFamilies[name]) {
                localeFamilies[name].forEach(function (x) {
                    defineLocale(x.name, x.config);
                });
            }

            // backwards compat for now: also set the locale
            // make sure we set the locale AFTER all child locales have been
            // created, so we won't end up with the child locale set.
            getSetGlobalLocale(name);


            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale, tmpLocale, parentConfig = baseConfig;
            // MERGE
            tmpLocale = loadLocale(name);
            if (tmpLocale != null) {
                parentConfig = tmpLocale._config;
            }
            config = mergeConfigs(parentConfig, config);
            locale = new Locale(config);
            locale.parentLocale = locales[name];
            locales[name] = locale;

            // backwards compat for now: also set the locale
            getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function listLocales() {
        return keys(locales);
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, expectedWeekday, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear != null) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        expectedWeekday = config._useUTC ? config._d.getUTCDay() : config._d.getDay();

        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }

        // check for mismatching day of week
        if (config._w && typeof config._w.d !== 'undefined' && config._w.d !== expectedWeekday) {
            getParsingFlags(config).weekdayMismatch = true;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            var curWeek = weekOfYear(createLocal(), dow, doy);

            weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

            // Default to current week.
            week = defaults(w.w, curWeek.week);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from beginning of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to beginning of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
        ['YYYY-DDD', /\d{4}-\d{3}/],
        ['YYYY-MM', /\d{4}-\d\d/, false],
        ['YYYYYYMMDD', /[+-]\d{10}/],
        ['YYYYMMDD', /\d{8}/],
        // YYYYMM is NOT allowed by the standard
        ['GGGG[W]WWE', /\d{4}W\d{3}/],
        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
        ['YYYYDDD', /\d{7}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
        ['HH:mm', /\d\d:\d\d/],
        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
        ['HHmmss', /\d\d\d\d\d\d/],
        ['HHmm', /\d\d\d\d/],
        ['HH', /\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime, dateFormat, timeFormat, tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
    var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/;

    function extractFromRFC2822Strings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
        var result = [
            untruncateYear(yearStr),
            defaultLocaleMonthsShort.indexOf(monthStr),
            parseInt(dayStr, 10),
            parseInt(hourStr, 10),
            parseInt(minuteStr, 10)
        ];

        if (secondStr) {
            result.push(parseInt(secondStr, 10));
        }

        return result;
    }

    function untruncateYear(yearStr) {
        var year = parseInt(yearStr, 10);
        if (year <= 49) {
            return 2000 + year;
        } else if (year <= 999) {
            return 1900 + year;
        }
        return year;
    }

    function preprocessRFC2822(s) {
        // Remove comments and folding whitespace and replace multiple-spaces with a single space
        return s.replace(/\([^)]*\)|[\n\t]/g, ' ').replace(/(\s\s+)/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }

    function checkWeekday(weekdayStr, parsedInput, config) {
        if (weekdayStr) {
            // TODO: Replace the vanilla JS Date object with an indepentent day-of-week check.
            var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                weekdayActual = new Date(parsedInput[0], parsedInput[1], parsedInput[2]).getDay();
            if (weekdayProvided !== weekdayActual) {
                getParsingFlags(config).weekdayMismatch = true;
                config._isValid = false;
                return false;
            }
        }
        return true;
    }

    var obsOffsets = {
        UT: 0,
        GMT: 0,
        EDT: -4 * 60,
        EST: -5 * 60,
        CDT: -5 * 60,
        CST: -6 * 60,
        MDT: -6 * 60,
        MST: -7 * 60,
        PDT: -7 * 60,
        PST: -8 * 60
    };

    function calculateOffset(obsOffset, militaryOffset, numOffset) {
        if (obsOffset) {
            return obsOffsets[obsOffset];
        } else if (militaryOffset) {
            // the only allowed military tz is Z
            return 0;
        } else {
            var hm = parseInt(numOffset, 10);
            var m = hm % 100, h = (hm - m) / 100;
            return h * 60 + m;
        }
    }

    // date and time from ref 2822 format
    function configFromRFC2822(config) {
        var match = rfc2822.exec(preprocessRFC2822(config._i));
        if (match) {
            var parsedArray = extractFromRFC2822Strings(match[4], match[3], match[2], match[5], match[6], match[7]);
            if (!checkWeekday(match[1], parsedArray, config)) {
                return;
            }

            config._a = parsedArray;
            config._tzm = calculateOffset(match[8], match[9], match[10]);

            config._d = createUTCDate.apply(null, config._a);
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

            getParsingFlags(config).rfc2822 = true;
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        configFromRFC2822(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        // Final attempt, use Input Fallback
        hooks.createFromInputFallback(config);
    }

    hooks.createFromInputFallback = deprecate(
        'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
        'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
        'discouraged and will be removed in an upcoming major release. Please refer to ' +
        'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // constant that refers to the ISO standard
    hooks.ISO_8601 = function () {};

    // constant that refers to the RFC 2822 form
    hooks.RFC_2822 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        if (config._f === hooks.RFC_2822) {
            configFromRFC2822(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            // console.log('token', token, 'parsedInput', parsedInput,
            //         'regex', getParseRegexForToken(token, config));
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._a[HOUR] <= 12 &&
            getParsingFlags(config).bigHour === true &&
            config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
            return obj && parseInt(obj, 10);
        });

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isDate(input)) {
            config._d = input;
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        }  else {
            configFromInput(config);
        }

        if (!isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (isUndefined(input)) {
            config._d = new Date(hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (isObject(input)) {
            configFromObject(config);
        } else if (isNumber(input)) {
            // from milliseconds
            config._d = new Date(input);
        } else {
            hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (locale === true || locale === false) {
            strict = locale;
            locale = undefined;
        }

        if ((isObject(input) && isObjectEmpty(input)) ||
                (isArray(input) && input.length === 0)) {
            input = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
        'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other < this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other > this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +(new Date());
    };

    var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

    function isDurationValid(m) {
        for (var key in m) {
            if (!(indexOf.call(ordering, key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
                return false;
            }
        }

        var unitHasDecimal = false;
        for (var i = 0; i < ordering.length; ++i) {
            if (m[ordering[i]]) {
                if (unitHasDecimal) {
                    return false; // only allow non-integers for smallest unit
                }
                if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                    unitHasDecimal = true;
                }
            }
        }

        return true;
    }

    function isValid$1() {
        return this._isValid;
    }

    function createInvalid$1() {
        return createDuration(NaN);
    }

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        this._isValid = isDurationValid(normalizedInput);

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible to translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    function absRound (number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // FORMATTING

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z',  matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = (string || '').match(matcher);

        if (matches === null) {
            return null;
        }

        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return minutes === 0 ?
          0 :
          parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            hooks.updateOffset(res, false);
            return res;
        } else {
            return createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime, keepMinutes) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
                if (input === null) {
                    return this;
                }
            } else if (Math.abs(input) < 16 && !keepMinutes) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    addSubtract(this, createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm != null) {
            this.utcOffset(this._tzm, false, true);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);
            if (tZone != null) {
                this.utcOffset(tZone);
            }
            else {
                this.utcOffset(0, true);
            }
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset () {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc () {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    // and further modified to allow for strings containing both week and day
    var isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

    function createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (isNumber(input)) {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])                         * sign,
                h  : toInt(match[HOUR])                         * sign,
                m  : toInt(match[MINUTE])                       * sign,
                s  : toInt(match[SECOND])                       * sign,
                ms : toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
            };
        } else if (!!(match = isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                w : parseIso(match[4], sign),
                d : parseIso(match[5], sign),
                h : parseIso(match[6], sign),
                m : parseIso(match[7], sign),
                s : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return {milliseconds: 0, months: 0};
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
                'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = createDuration(val, period);
            addSubtract(this, dur, direction);
            return this;
        };
    }

    function addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (months) {
            setMonth(mom, get(mom, 'Month') + months * isAdding);
        }
        if (days) {
            set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
        }
        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (updateOffset) {
            hooks.updateOffset(mom, days || months);
        }
    }

    var add      = createAdder(1, 'add');
    var subtract = createAdder(-1, 'subtract');

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
    }

    function calendar$1 (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = hooks.calendarFormat(this, sod) || 'sameElse';

        var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

        return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween (from, to, units, inclusivity) {
        var localFrom = isMoment(from) ? from : createLocal(from),
            localTo = isMoment(to) ? to : createLocal(to);
        if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
            return false;
        }
        inclusivity = inclusivity || '()';
        return (inclusivity[0] === '(' ? this.isAfter(localFrom, units) : !this.isBefore(localFrom, units)) &&
            (inclusivity[1] === ')' ? this.isBefore(localTo, units) : !this.isAfter(localTo, units));
    }

    function isSame (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
        }
    }

    function isSameOrAfter (input, units) {
        return this.isSame(input, units) || this.isAfter(input, units);
    }

    function isSameOrBefore (input, units) {
        return this.isSame(input, units) || this.isBefore(input, units);
    }

    function diff (input, units, asFloat) {
        var that,
            zoneDelta,
            output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        switch (units) {
            case 'year': output = monthDiff(this, that) / 12; break;
            case 'month': output = monthDiff(this, that); break;
            case 'quarter': output = monthDiff(this, that) / 3; break;
            case 'second': output = (this - that) / 1e3; break; // 1000
            case 'minute': output = (this - that) / 6e4; break; // 1000 * 60
            case 'hour': output = (this - that) / 36e5; break; // 1000 * 60 * 60
            case 'day': output = (this - that - zoneDelta) / 864e5; break; // 1000 * 60 * 60 * 24, negate dst
            case 'week': output = (this - that - zoneDelta) / 6048e5; break; // 1000 * 60 * 60 * 24 * 7, negate dst
            default: output = this - that;
        }

        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function toISOString(keepOffset) {
        if (!this.isValid()) {
            return null;
        }
        var utc = keepOffset !== true;
        var m = utc ? this.clone().utc() : this;
        if (m.year() < 0 || m.year() > 9999) {
            return formatMoment(m, utc ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ');
        }
        if (isFunction(Date.prototype.toISOString)) {
            // native implementation is ~50x faster, use it when we can
            if (utc) {
                return this.toDate().toISOString();
            } else {
                return new Date(this.valueOf() + this.utcOffset() * 60 * 1000).toISOString().replace('Z', formatMoment(m, 'Z'));
            }
        }
        return formatMoment(m, utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ');
    }

    /**
     * Return a human readable representation of a moment that can
     * also be evaluated to get a new moment which is the same
     *
     * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
     */
    function inspect () {
        if (!this.isValid()) {
            return 'moment.invalid(/* ' + this._i + ' */)';
        }
        var func = 'moment';
        var zone = '';
        if (!this.isLocal()) {
            func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
            zone = 'Z';
        }
        var prefix = '[' + func + '("]';
        var year = (0 <= this.year() && this.year() <= 9999) ? 'YYYY' : 'YYYYYY';
        var datetime = '-MM-DD[T]HH:mm:ss.SSS';
        var suffix = zone + '[")]';

        return this.format(prefix + year + datetime + suffix);
    }

    function format (inputString) {
        if (!inputString) {
            inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 createLocal(time).isValid())) {
            return createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow (withoutSuffix) {
        return this.from(createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 createLocal(time).isValid())) {
            return createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow (withoutSuffix) {
        return this.to(createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    var MS_PER_SECOND = 1000;
    var MS_PER_MINUTE = 60 * MS_PER_SECOND;
    var MS_PER_HOUR = 60 * MS_PER_MINUTE;
    var MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;

    // actual modulo - handles negative numbers (for dates before 1970):
    function mod$1(dividend, divisor) {
        return (dividend % divisor + divisor) % divisor;
    }

    function localStartOfDate(y, m, d) {
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return new Date(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return new Date(y, m, d).valueOf();
        }
    }

    function utcStartOfDate(y, m, d) {
        // Date.UTC remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return Date.UTC(y, m, d);
        }
    }

    function startOf (units) {
        var time;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        var startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year(), 0, 1);
                break;
            case 'quarter':
                time = startOfDate(this.year(), this.month() - this.month() % 3, 1);
                break;
            case 'month':
                time = startOfDate(this.year(), this.month(), 1);
                break;
            case 'week':
                time = startOfDate(this.year(), this.month(), this.date() - this.weekday());
                break;
            case 'isoWeek':
                time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1));
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date());
                break;
            case 'hour':
                time = this._d.valueOf();
                time -= mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR);
                break;
            case 'minute':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_MINUTE);
                break;
            case 'second':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_SECOND);
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function endOf (units) {
        var time;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        var startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year() + 1, 0, 1) - 1;
                break;
            case 'quarter':
                time = startOfDate(this.year(), this.month() - this.month() % 3 + 3, 1) - 1;
                break;
            case 'month':
                time = startOfDate(this.year(), this.month() + 1, 1) - 1;
                break;
            case 'week':
                time = startOfDate(this.year(), this.month(), this.date() - this.weekday() + 7) - 1;
                break;
            case 'isoWeek':
                time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1) + 7) - 1;
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
                break;
            case 'hour':
                time = this._d.valueOf();
                time += MS_PER_HOUR - mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR) - 1;
                break;
            case 'minute':
                time = this._d.valueOf();
                time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
                break;
            case 'second':
                time = this._d.valueOf();
                time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function valueOf () {
        return this._d.valueOf() - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate () {
        return new Date(this.valueOf());
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON () {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function isValid$2 () {
        return isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PRIORITY

    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);


    // PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input,
                this.week(),
                this.weekday(),
                this.localeData()._week.dow,
                this.localeData()._week.doy);
    }

    function getSetISOWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PRIORITY

    addUnitPriority('quarter', 7);

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PRIORITY
    addUnitPriority('date', 9);

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        // TODO: Remove "ordinalParse" fallback in next major release.
        return isStrict ?
          (locale._dayOfMonthOrdinalParse || locale._ordinalParse) :
          locale._dayOfMonthOrdinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0]);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PRIORITY
    addUnitPriority('dayOfYear', 4);

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PRIORITY

    addUnitPriority('minute', 14);

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PRIORITY

    addUnitPriority('second', 15);

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PRIORITY

    addUnitPriority('millisecond', 16);

    // PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var proto = Moment.prototype;

    proto.add               = add;
    proto.calendar          = calendar$1;
    proto.clone             = clone;
    proto.diff              = diff;
    proto.endOf             = endOf;
    proto.format            = format;
    proto.from              = from;
    proto.fromNow           = fromNow;
    proto.to                = to;
    proto.toNow             = toNow;
    proto.get               = stringGet;
    proto.invalidAt         = invalidAt;
    proto.isAfter           = isAfter;
    proto.isBefore          = isBefore;
    proto.isBetween         = isBetween;
    proto.isSame            = isSame;
    proto.isSameOrAfter     = isSameOrAfter;
    proto.isSameOrBefore    = isSameOrBefore;
    proto.isValid           = isValid$2;
    proto.lang              = lang;
    proto.locale            = locale;
    proto.localeData        = localeData;
    proto.max               = prototypeMax;
    proto.min               = prototypeMin;
    proto.parsingFlags      = parsingFlags;
    proto.set               = stringSet;
    proto.startOf           = startOf;
    proto.subtract          = subtract;
    proto.toArray           = toArray;
    proto.toObject          = toObject;
    proto.toDate            = toDate;
    proto.toISOString       = toISOString;
    proto.inspect           = inspect;
    proto.toJSON            = toJSON;
    proto.toString          = toString;
    proto.unix              = unix;
    proto.valueOf           = valueOf;
    proto.creationData      = creationData;
    proto.year       = getSetYear;
    proto.isLeapYear = getIsLeapYear;
    proto.weekYear    = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;
    proto.quarter = proto.quarters = getSetQuarter;
    proto.month       = getSetMonth;
    proto.daysInMonth = getDaysInMonth;
    proto.week           = proto.weeks        = getSetWeek;
    proto.isoWeek        = proto.isoWeeks     = getSetISOWeek;
    proto.weeksInYear    = getWeeksInYear;
    proto.isoWeeksInYear = getISOWeeksInYear;
    proto.date       = getSetDayOfMonth;
    proto.day        = proto.days             = getSetDayOfWeek;
    proto.weekday    = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear  = getSetDayOfYear;
    proto.hour = proto.hours = getSetHour;
    proto.minute = proto.minutes = getSetMinute;
    proto.second = proto.seconds = getSetSecond;
    proto.millisecond = proto.milliseconds = getSetMillisecond;
    proto.utcOffset            = getSetOffset;
    proto.utc                  = setOffsetToUTC;
    proto.local                = setOffsetToLocal;
    proto.parseZone            = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST                = isDaylightSavingTime;
    proto.isLocal              = isLocal;
    proto.isUtcOffset          = isUtcOffset;
    proto.isUtc                = isUtc;
    proto.isUTC                = isUtc;
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;
    proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
    proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

    function createUnix (input) {
        return createLocal(input * 1000);
    }

    function createInZone () {
        return createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat (string) {
        return string;
    }

    var proto$1 = Locale.prototype;

    proto$1.calendar        = calendar;
    proto$1.longDateFormat  = longDateFormat;
    proto$1.invalidDate     = invalidDate;
    proto$1.ordinal         = ordinal;
    proto$1.preparse        = preParsePostFormat;
    proto$1.postformat      = preParsePostFormat;
    proto$1.relativeTime    = relativeTime;
    proto$1.pastFuture      = pastFuture;
    proto$1.set             = set;

    proto$1.months            =        localeMonths;
    proto$1.monthsShort       =        localeMonthsShort;
    proto$1.monthsParse       =        localeMonthsParse;
    proto$1.monthsRegex       = monthsRegex;
    proto$1.monthsShortRegex  = monthsShortRegex;
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;

    proto$1.weekdays       =        localeWeekdays;
    proto$1.weekdaysMin    =        localeWeekdaysMin;
    proto$1.weekdaysShort  =        localeWeekdaysShort;
    proto$1.weekdaysParse  =        localeWeekdaysParse;

    proto$1.weekdaysRegex       =        weekdaysRegex;
    proto$1.weekdaysShortRegex  =        weekdaysShortRegex;
    proto$1.weekdaysMinRegex    =        weekdaysMinRegex;

    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;

    function get$1 (format, index, field, setter) {
        var locale = getLocale();
        var utc = createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl (format, index, field) {
        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return get$1(format, index, field, 'month');
        }

        var i;
        var out = [];
        for (i = 0; i < 12; i++) {
            out[i] = get$1(format, i, field, 'month');
        }
        return out;
    }

    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function listWeekdaysImpl (localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = getLocale(),
            shift = localeSorted ? locale._week.dow : 0;

        if (index != null) {
            return get$1(format, (index + shift) % 7, field, 'day');
        }

        var i;
        var out = [];
        for (i = 0; i < 7; i++) {
            out[i] = get$1(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function listMonths (format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function listMonthsShort (format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function listWeekdays (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function listWeekdaysShort (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function listWeekdaysMin (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    getSetGlobalLocale('en', {
        dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports

    hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
    hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);

    var mathAbs = Math.abs;

    function abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function addSubtract$1 (duration, input, value, direction) {
        var other = createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function add$1 (input, value) {
        return addSubtract$1(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function subtract$1 (input, value) {
        return addSubtract$1(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        if (!this.isValid()) {
            return NaN;
        }
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'quarter' || units === 'year') {
            days = this._days + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            switch (units) {
                case 'month':   return months;
                case 'quarter': return months / 3;
                case 'year':    return months / 12;
            }
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function valueOf$1 () {
        if (!this.isValid()) {
            return NaN;
        }
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asQuarters     = makeAs('Q');
    var asYears        = makeAs('y');

    function clone$1 () {
        return createDuration(this);
    }

    function get$2 (units) {
        units = normalizeUnits(units);
        return this.isValid() ? this[units + 's']() : NaN;
    }

    function makeGetter(name) {
        return function () {
            return this.isValid() ? this._data[name] : NaN;
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        ss: 44,         // a few seconds to seconds
        s : 45,         // seconds to minute
        m : 45,         // minutes to hour
        h : 22,         // hours to day
        d : 26,         // days to month
        M : 11          // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime$1 (posNegDuration, withoutSuffix, locale) {
        var duration = createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds <= thresholds.ss && ['s', seconds]  ||
                seconds < thresholds.s   && ['ss', seconds] ||
                minutes <= 1             && ['m']           ||
                minutes < thresholds.m   && ['mm', minutes] ||
                hours   <= 1             && ['h']           ||
                hours   < thresholds.h   && ['hh', hours]   ||
                days    <= 1             && ['d']           ||
                days    < thresholds.d   && ['dd', days]    ||
                months  <= 1             && ['M']           ||
                months  < thresholds.M   && ['MM', months]  ||
                years   <= 1             && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set the rounding function for relative time strings
    function getSetRelativeTimeRounding (roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof(roundingFunction) === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    // This function allows you to set a threshold for relative time strings
    function getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        if (threshold === 's') {
            thresholds.ss = limit - 1;
        }
        return true;
    }

    function humanize (withSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var locale = this.localeData();
        var output = relativeTime$1(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var abs$1 = Math.abs;

    function sign(x) {
        return ((x > 0) - (x < 0)) || +x;
    }

    function toISOString$1() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var seconds = abs$1(this._milliseconds) / 1000;
        var days         = abs$1(this._days);
        var months       = abs$1(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        var totalSign = total < 0 ? '-' : '';
        var ymSign = sign(this._months) !== sign(total) ? '-' : '';
        var daysSign = sign(this._days) !== sign(total) ? '-' : '';
        var hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

        return totalSign + 'P' +
            (Y ? ymSign + Y + 'Y' : '') +
            (M ? ymSign + M + 'M' : '') +
            (D ? daysSign + D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? hmsSign + h + 'H' : '') +
            (m ? hmsSign + m + 'M' : '') +
            (s ? hmsSign + s + 'S' : '');
    }

    var proto$2 = Duration.prototype;

    proto$2.isValid        = isValid$1;
    proto$2.abs            = abs;
    proto$2.add            = add$1;
    proto$2.subtract       = subtract$1;
    proto$2.as             = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds      = asSeconds;
    proto$2.asMinutes      = asMinutes;
    proto$2.asHours        = asHours;
    proto$2.asDays         = asDays;
    proto$2.asWeeks        = asWeeks;
    proto$2.asMonths       = asMonths;
    proto$2.asQuarters     = asQuarters;
    proto$2.asYears        = asYears;
    proto$2.valueOf        = valueOf$1;
    proto$2._bubble        = bubble;
    proto$2.clone          = clone$1;
    proto$2.get            = get$2;
    proto$2.milliseconds   = milliseconds;
    proto$2.seconds        = seconds;
    proto$2.minutes        = minutes;
    proto$2.hours          = hours;
    proto$2.days           = days;
    proto$2.weeks          = weeks;
    proto$2.months         = months;
    proto$2.years          = years;
    proto$2.humanize       = humanize;
    proto$2.toISOString    = toISOString$1;
    proto$2.toString       = toISOString$1;
    proto$2.toJSON         = toISOString$1;
    proto$2.locale         = locale;
    proto$2.localeData     = localeData;

    proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
    proto$2.lang = lang;

    // Side effect imports

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports


    hooks.version = '2.24.0';

    setHookCallback(createLocal);

    hooks.fn                    = proto;
    hooks.min                   = min;
    hooks.max                   = max;
    hooks.now                   = now;
    hooks.utc                   = createUTC;
    hooks.unix                  = createUnix;
    hooks.months                = listMonths;
    hooks.isDate                = isDate;
    hooks.locale                = getSetGlobalLocale;
    hooks.invalid               = createInvalid;
    hooks.duration              = createDuration;
    hooks.isMoment              = isMoment;
    hooks.weekdays              = listWeekdays;
    hooks.parseZone             = createInZone;
    hooks.localeData            = getLocale;
    hooks.isDuration            = isDuration;
    hooks.monthsShort           = listMonthsShort;
    hooks.weekdaysMin           = listWeekdaysMin;
    hooks.defineLocale          = defineLocale;
    hooks.updateLocale          = updateLocale;
    hooks.locales               = listLocales;
    hooks.weekdaysShort         = listWeekdaysShort;
    hooks.normalizeUnits        = normalizeUnits;
    hooks.relativeTimeRounding  = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat        = getCalendarFormat;
    hooks.prototype             = proto;

    // currently HTML5 input type only supports 24-hour formats
    hooks.HTML5_FMT = {
        DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm',             // <input type="datetime-local" />
        DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss',  // <input type="datetime-local" step="1" />
        DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS',   // <input type="datetime-local" step="0.001" />
        DATE: 'YYYY-MM-DD',                             // <input type="date" />
        TIME: 'HH:mm',                                  // <input type="time" />
        TIME_SECONDS: 'HH:mm:ss',                       // <input type="time" step="1" />
        TIME_MS: 'HH:mm:ss.SSS',                        // <input type="time" step="0.001" />
        WEEK: 'GGGG-[W]WW',                             // <input type="week" />
        MONTH: 'YYYY-MM'                                // <input type="month" />
    };

    return hooks;

})));

},{}],4:[function(require,module,exports){
var helpers = require('./helpers');
var exists = require('fs').existsSync;

// var safe_require = function(filename) {
// 	if (exists(filename + '.js')) {
// 		return require(filename);
// 	}
// 	return {};
// };

// var build_casual = function() {
// 	var casual = helpers.extend({}, helpers);
//
// 	casual.functions = function() {
// 		var adapter = {};
//
// 		Object.keys(this).forEach(function(name) {
// 			if (name[0] === '_') {
// 				adapter[name.slice(1)] = casual[name];
// 			}
// 		});
//
// 		return adapter;
// 	};
//
// 	var providers = [
// 		'address',
// 		'text',
// 		'internet',
// 		'person',
// 		'number',
// 		'date',
// 		'payment',
// 		'misc',
// 		'color'
// 	];
//
// 	casual.register_locale = function(locale) {
// 		casual.define(locale, function() {
// 			var casual = build_casual();
//
// 			providers.forEach(function(provider) {
// 				casual.register_provider(helpers.extend(
// 					require('./providers/' + provider),
// 					safe_require(__dirname + '/providers/' + locale + '/' + provider)
// 				));
// 			});
//
// 			return casual;
// 		});
// 	}
//
// 	var locales = [
// 		'en_US'
// 	];
//
// 	locales.forEach(casual.register_locale);
//
// 	return casual;
// };
//
// // Default locale is en_US
// module.exports = build_casual().en_US;

var build = function() {
	var casual = helpers.extend({}, helpers);

	casual.functions = function() {
		var adapter = {};

		Object.keys(this).forEach(function(name) {
			if (name[0] === '_') {
				adapter[name.slice(1)] = casual[name];
			}
		});

		return adapter;
	};

	casual.define("en_US", function() {
		var casual = build();

		casual.register_provider(helpers.extend(require("./providers/address"),require("./providers/en_US/address.js")));
		casual.register_provider(require("./providers/text"));
		casual.register_provider(require("./providers/internet"));
		casual.register_provider(require("./providers/person"));
		casual.register_provider(require("./providers/number"));
		casual.register_provider(require("./providers/date"));
		casual.register_provider(require("./providers/payment"));
		casual.register_provider(require("./providers/misc"));
		casual.register_provider(require("./providers/color"));

		return casual;
	});

	return casual;
}

// Default locale is en_US
module.exports = build().en_US;

},{"./helpers":5,"./providers/address":6,"./providers/color":7,"./providers/date":8,"./providers/en_US/address.js":9,"./providers/internet":10,"./providers/misc":11,"./providers/number":12,"./providers/payment":13,"./providers/person":14,"./providers/text":15,"fs":1}],5:[function(require,module,exports){
var number = require('./providers/number');

var random_element = function(array) {
	var index = this.integer(0, array.length - 1);
	return array[index];
};

var random_key = function(object) {
	var keys = Object.keys(object);
	return this.random_element(keys);
};

var random_value = function(object) {
	return object[this.random_key(object)];
};

var register_provider = function(provider) {
	for (var i in provider) {
		this.define(i, provider[i]);
	}
};

var extend = function(a, b) {
	for (var i in b) {
		a[i] = b[i];
	}

	return a;
};

var define = function(name, generator) {
	if (typeof generator != 'function') {
		this[name] = generator;
		return;
	}

	if (generator.length) {
		this[name] = generator.bind(this);
	} else {
		Object.defineProperty(this, name, { 
			get: generator,
			configurable: true
		});
	}

	this['_' + name] = generator.bind(this);
};

var numerify = function(format) {
	return format.replace(/#/g, this._digit);
};

var letterify = function(format) {
	return format.replace(/X/g, this._letter);
};

var join = function() {
	var tokens = Array.prototype.slice.apply(arguments);
	return tokens.filter(Boolean).join(' ');
};

var populate = function(format) {
	var casual = this;
	return format.replace(/\{\{(.+?)\}\}/g, function(match, generator) {
		return casual['_' + generator]();
	});
};

var populate_one_of = function(formats) {
	return this.populate(this.random_element(formats));
};

module.exports = {
	random_element: random_element,
	random_value: random_value,
	random_key: random_key,
	register_provider: register_provider,
	extend: extend,
	define: define,
	numerify: numerify,
	letterify:letterify,
	join: join,
	populate: populate,
	populate_one_of: populate_one_of
};

},{"./providers/number":12}],6:[function(require,module,exports){
var provider = {
	city_prefixes: ['North', 'East', 'West', 'South', 'New', 'Lake', 'Port'],

	city_suffixes: ['town', 'ton', 'land', 'ville', 'berg', 'burgh', 'borough', 'bury', 'view', 'port', 'mouth', 'stad', 'furt', 'chester', 'mouth', 'fort', 'haven', 'side', 'shire'],

	street_suffixes: ['Alley', 'Avenue', 'Branch', 'Bridge', 'Brook', 'Brooks', 'Burg', 'Burgs', 'Bypass', 'Camp', 'Canyon', 'Cape', 'Causeway', 'Center', 'Centers', 'Circle', 'Circles', 'Cliff', 'Cliffs', 'Club', 'Common', 'Corner', 'Corners', 'Course', 'Court', 'Courts', 'Cove', 'Coves', 'Creek', 'Crescent', 'Crest', 'Crossing', 'Crossroad', 'Curve', 'Dale', 'Dam', 'Divide', 'Drive', 'Drive', 'Drives', 'Estate', 'Estates', 'Expressway', 'Extension', 'Extensions', 'Fall', 'Falls', 'Ferry', 'Field', 'Fields', 'Flat', 'Flats', 'Ford', 'Fords', 'Forest', 'Forge', 'Forges', 'Fork', 'Forks', 'Fort', 'Freeway', 'Garden', 'Gardens', 'Gateway', 'Glen', 'Glens', 'Green', 'Greens', 'Grove', 'Groves', 'Harbor', 'Harbors', 'Haven', 'Heights', 'Highway', 'Hill', 'Hills', 'Hollow', 'Inlet', 'Inlet', 'Island', 'Island', 'Islands', 'Islands', 'Isle', 'Isle', 'Junction', 'Junctions', 'Key', 'Keys', 'Knoll', 'Knolls', 'Lake', 'Lakes', 'Land', 'Landing', 'Lane', 'Light', 'Lights', 'Loaf', 'Lock', 'Locks', 'Locks', 'Lodge', 'Lodge', 'Loop', 'Mall', 'Manor', 'Manors', 'Meadow', 'Meadows', 'Mews', 'Mill', 'Mills', 'Mission', 'Mission', 'Motorway', 'Mount', 'Mountain', 'Mountain', 'Mountains', 'Mountains', 'Neck', 'Orchard', 'Oval', 'Overpass', 'Park', 'Parks', 'Parkway', 'Parkways', 'Pass', 'Passage', 'Path', 'Pike', 'Pine', 'Pines', 'Place', 'Plain', 'Plains', 'Plains', 'Plaza', 'Plaza', 'Point', 'Points', 'Port', 'Port', 'Ports', 'Ports', 'Prairie', 'Prairie', 'Radial', 'Ramp', 'Ranch', 'Rapid', 'Rapids', 'Rest', 'Ridge', 'Ridges', 'River', 'Road', 'Road', 'Roads', 'Roads', 'Route', 'Row', 'Rue', 'Run', 'Shoal', 'Shoals', 'Shore', 'Shores', 'Skyway', 'Spring', 'Springs', 'Springs', 'Spur', 'Spurs', 'Square', 'Square', 'Squares', 'Squares', 'Station', 'Station', 'Stravenue', 'Stravenue', 'Stream', 'Stream', 'Street', 'Street', 'Streets', 'Summit', 'Summit', 'Terrace', 'Throughway', 'Trace', 'Track', 'Trafficway', 'Trail', 'Trail', 'Tunnel', 'Tunnel', 'Turnpike', 'Turnpike', 'Underpass', 'Union', 'Unions', 'Valley', 'Valleys', 'Via', 'Viaduct', 'View', 'Views', 'Village', 'Village', 'Villages', 'Ville', 'Vista', 'Vista', 'Walk', 'Walks', 'Wall', 'Way', 'Ways', 'Well', 'Wells'],

	countries: ['Afghanistan', 'Albania', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Anguilla', 'Antarctica (the territory South of 60 deg S)', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Bouvet Island (Bouvetoya)', 'Brazil', 'British Indian Ocean Territory (Chagos Archipelago)', 'British Virgin Islands', 'Brunei Darussalam', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Cayman Islands', 'Central African Republic', 'Chad', 'Chile', 'China', 'Christmas Island', 'Cocos (Keeling) Islands', 'Colombia', 'Comoros', 'Congo', 'Cook Islands', 'Costa Rica', 'Cote d\'Ivoire', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Faroe Islands', 'Falkland Islands (Malvinas)', 'Fiji', 'Finland', 'France', 'French Guiana', 'French Polynesia', 'French Southern Territories', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guam', 'Guatemala', 'Guernsey', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Heard Island and McDonald Islands', 'Holy See (Vatican City State)', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea', 'Korea', 'Kuwait', 'Kyrgyz Republic', 'Lao People\'s Democratic Republic', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libyan Arab Jamahiriya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macao', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Mayotte', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands Antilles', 'Netherlands', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Norfolk Island', 'Northern Mariana Islands', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestinian Territory', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Pitcairn Islands', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Reunion', 'Romania', 'Russian Federation', 'Rwanda', 'Saint Barthelemy', 'Saint Helena', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Martin', 'Saint Pierre and Miquelon', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia (Slovak Republic)', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Georgia and the South Sandwich Islands', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Svalbard & Jan Mayen Islands', 'Swaziland', 'Sweden', 'Switzerland', 'Syrian Arab Republic', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tokelau', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks and Caicos Islands', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States of America', 'United States Minor Outlying Islands', 'United States Virgin Islands', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam', 'Wallis and Futuna', 'Western Sahara', 'Yemen', 'Zambia', 'Zimbabwe'],

	zip_formats: ['#####', '#####-####'],

	building_number_formats: ['##', '###', '####'],

	city_formats: [
		'{{city_prefix}} {{first_name}}{{city_suffix}}',
		'{{city_prefix}} {{first_name}}',
		'{{first_name}}{{city_suffix}}',
		'{{last_name}}{{city_suffix}}'
	],

	street_formats: [
		'{{first_name}} {{street_suffix}}',
		'{{last_name}} {{street_suffix}}'
	],

	address1_formats: [
		'{{building_number}} {{street}}',
		'{{building_number}} {{street}} {{address2}}',
	],

	address2_formats: ['Apt. ###', 'Suite ###'],

	address_formats: [
		'{{address1}}\n{{city}}, {{state_abbr}} {{zip}}',
	],

	country: function() {
		return this.random_element(this.countries);
	},

	city_prefix: function() {
		return this.random_element(this.city_prefixes);
	},

	city_suffix: function() {
		return this.random_element(this.city_suffixes);
	},

	city: function() {
		return this.populate_one_of(this.city_formats);
	},

	zip: function(digits) {
		if (digits === 5) {
			return this.numerify(this.zip_formats[0]);
		} else if (digits === 9) {
			return this.numerify(this.zip_formats[1]);
		} else {
			return this.numerify(this.random_element(this.zip_formats));
		}
	},

	street_suffix: function() {
		return this.random_element(this.street_suffixes);
	},

	street: function() {
		return this.populate_one_of(this.street_formats);
	},

	address: function() {
		return this.populate_one_of(this.address_formats);
	},

	address1: function() {
		return this.populate_one_of(this.address1_formats);
	},

	address2: function() {
		return this.numerify(this.random_element(this.address2_formats));
	},

	latitude: function () {
		return (this.integer(180 * 10000) / 10000.0 - 90.0).toFixed(4);
	},

	longitude: function () {
		return (this.integer(360 * 10000) / 10000.0 - 180.0).toFixed(4);
	},

	building_number: function() {
		return this.numerify(this.random_element(this.building_number_formats));
	}
};

module.exports = provider;

},{}],7:[function(require,module,exports){
var provider = {

	safe_color_names: [
		'black', 'maroon', 'green', 'navy', 'olive',
		'purple', 'teal', 'lime', 'blue', 'silver',
		'gray', 'yellow', 'fuchsia', 'aqua', 'white'
	],

	color_names: [
		'AliceBlue', 'AntiqueWhite', 'Aqua', 'Aquamarine',
		'Azure', 'Beige', 'Bisque', 'Black', 'BlanchedAlmond',
		'Blue', 'BlueViolet', 'Brown', 'BurlyWood', 'CadetBlue',
		'Chartreuse', 'Chocolate', 'Coral', 'CornflowerBlue',
		'Cornsilk', 'Crimson', 'Cyan', 'DarkBlue', 'DarkCyan',
		'DarkGoldenRod', 'DarkGray', 'DarkGreen', 'DarkKhaki',
		'DarkMagenta', 'DarkOliveGreen', 'Darkorange', 'DarkOrchid',
		'DarkRed', 'DarkSalmon', 'DarkSeaGreen', 'DarkSlateBlue',
		'DarkSlateGray', 'DarkTurquoise', 'DarkViolet', 'DeepPink',
		'DeepSkyBlue', 'DimGray', 'DimGrey', 'DodgerBlue', 'FireBrick',
		'FloralWhite', 'ForestGreen', 'Fuchsia', 'Gainsboro', 'GhostWhite',
		'Gold', 'GoldenRod', 'Gray', 'Green', 'GreenYellow', 'HoneyDew',
		'HotPink', 'IndianRed ', 'Indigo ', 'Ivory', 'Khaki', 'Lavender',
		'LavenderBlush', 'LawnGreen', 'LemonChiffon', 'LightBlue', 'LightCoral',
		'LightCyan', 'LightGoldenRodYellow', 'LightGray', 'LightGreen', 'LightPink',
		'LightSalmon', 'LightSeaGreen', 'LightSkyBlue', 'LightSlateGray', 'LightSteelBlue',
		'LightYellow', 'Lime', 'LimeGreen', 'Linen', 'Magenta', 'Maroon', 'MediumAquaMarine',
		'MediumBlue', 'MediumOrchid', 'MediumPurple', 'MediumSeaGreen', 'MediumSlateBlue',
		'MediumSpringGreen', 'MediumTurquoise', 'MediumVioletRed', 'MidnightBlue',
		'MintCream', 'MistyRose', 'Moccasin', 'NavajoWhite', 'Navy', 'OldLace', 'Olive',
		'OliveDrab', 'Orange', 'OrangeRed', 'Orchid', 'PaleGoldenRod', 'PaleGreen',
		'PaleTurquoise', 'PaleVioletRed', 'PapayaWhip', 'PeachPuff', 'Peru', 'Pink', 'Plum',
		'PowderBlue', 'Purple', 'Red', 'RosyBrown', 'RoyalBlue', 'SaddleBrown', 'Salmon',
		'SandyBrown', 'SeaGreen', 'SeaShell', 'Sienna', 'Silver', 'SkyBlue', 'SlateBlue',
		'SlateGray', 'Snow', 'SpringGreen', 'SteelBlue', 'Tan', 'Teal', 'Thistle', 'Tomato',
		'Turquoise', 'Violet', 'Wheat', 'White', 'WhiteSmoke', 'Yellow', 'YellowGreen'
	],

	color_name: function() {
		return this.random_element(this.color_names);
	},

	safe_color_name: function() {
		return this.random_element(this.safe_color_names);
	},

	rgb_hex: function() {
		return '#' + ('000000' + this.integer(0, 16777216).toString(16)).slice(-6);
	},

	rgb_array: function() {
		return [this.integer(0, 255), this.integer(0, 255), this.integer(0, 255)];
	}
};

module.exports = provider;

},{}],8:[function(require,module,exports){
var moment = require('moment');

var provider = {
	centuries: ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'],

	timezones: ['Europe/Andorra', 'Asia/Dubai', 'Asia/Kabul', 'America/Antigua', 'America/Anguilla', 'Europe/Tirane', 'Asia/Yerevan', 'Africa/Luanda', 'Antarctica/McMurdo', 'Antarctica/South_Pole', 'Antarctica/Rothera', 'Antarctica/Palmer', 'Antarctica/Mawson', 'Antarctica/Davis', 'Antarctica/Casey', 'Antarctica/Vostok', 'Antarctica/DumontDUrville', 'Antarctica/Syowa', 'America/Argentina/Buenos_Aires', 'America/Argentina/Cordoba', 'America/Argentina/Salta', 'America/Argentina/Jujuy', 'America/Argentina/Tucuman', 'America/Argentina/Catamarca', 'America/Argentina/La_Rioja', 'America/Argentina/San_Juan', 'America/Argentina/Mendoza', 'America/Argentina/San_Luis', 'America/Argentina/Rio_Gallegos', 'America/Argentina/Ushuaia', 'Pacific/Pago_Pago', 'Europe/Vienna', 'Australia/Lord_Howe', 'Antarctica/Macquarie', 'Australia/Hobart', 'Australia/Currie', 'Australia/Melbourne', 'Australia/Sydney', 'Australia/Broken_Hill', 'Australia/Brisbane', 'Australia/Lindeman', 'Australia/Adelaide', 'Australia/Darwin', 'Australia/Perth', 'Australia/Eucla', 'America/Aruba', 'Europe/Mariehamn', 'Asia/Baku', 'Europe/Sarajevo', 'America/Barbados', 'Asia/Dhaka', 'Europe/Brussels', 'Africa/Ouagadougou', 'Europe/Sofia', 'Asia/Bahrain', 'Africa/Bujumbura', 'Africa/Porto-Novo', 'America/St_Barthelemy', 'Atlantic/Bermuda', 'Asia/Brunei', 'America/La_Paz', 'America/Kralendijk', 'America/Noronha', 'America/Belem', 'America/Fortaleza', 'America/Recife', 'America/Araguaina', 'America/Maceio', 'America/Bahia', 'America/Sao_Paulo', 'America/Campo_Grande', 'America/Cuiaba', 'America/Santarem', 'America/Porto_Velho', 'America/Boa_Vista', 'America/Manaus', 'America/Eirunepe', 'America/Rio_Branco', 'America/Nassau', 'Asia/Thimphu', 'Africa/Gaborone', 'Europe/Minsk', 'America/Belize', 'America/St_Johns', 'America/Halifax', 'America/Glace_Bay', 'America/Moncton', 'America/Goose_Bay', 'America/Blanc-Sablon', 'America/Montreal', 'America/Toronto', 'America/Nipigon', 'America/Thunder_Bay', 'America/Iqaluit', 'America/Pangnirtung', 'America/Resolute', 'America/Atikokan', 'America/Rankin_Inlet', 'America/Winnipeg', 'America/Rainy_River', 'America/Regina', 'America/Swift_Current', 'America/Edmonton', 'America/Cambridge_Bay', 'America/Yellowknife', 'America/Inuvik', 'America/Creston', 'America/Dawson_Creek', 'America/Vancouver', 'America/Whitehorse', 'America/Dawson', 'Indian/Cocos', 'Africa/Kinshasa', 'Africa/Lubumbashi', 'Africa/Bangui', 'Africa/Brazzaville', 'Europe/Zurich', 'Africa/Abidjan', 'Pacific/Rarotonga', 'America/Santiago', 'Pacific/Easter', 'Africa/Douala', 'Asia/Shanghai', 'Asia/Harbin', 'Asia/Chongqing', 'Asia/Urumqi', 'Asia/Kashgar', 'America/Bogota', 'America/Costa_Rica', 'America/Havana', 'Atlantic/Cape_Verde', 'America/Curacao', 'Indian/Christmas', 'Asia/Nicosia', 'Europe/Prague', 'Europe/Berlin', 'Europe/Busingen', 'Africa/Djibouti', 'Europe/Copenhagen', 'America/Dominica', 'America/Santo_Domingo', 'Africa/Algiers', 'America/Guayaquil', 'Pacific/Galapagos', 'Europe/Tallinn', 'Africa/Cairo', 'Africa/El_Aaiun', 'Africa/Asmara', 'Europe/Madrid', 'Africa/Ceuta', 'Atlantic/Canary', 'Africa/Addis_Ababa', 'Europe/Helsinki', 'Pacific/Fiji', 'Atlantic/Stanley', 'Pacific/Chuuk', 'Pacific/Pohnpei', 'Pacific/Kosrae', 'Atlantic/Faroe', 'Europe/Paris', 'Africa/Libreville', 'Europe/London', 'America/Grenada', 'Asia/Tbilisi', 'America/Cayenne', 'Europe/Guernsey', 'Africa/Accra', 'Europe/Gibraltar', 'America/Godthab', 'America/Danmarkshavn', 'America/Scoresbysund', 'America/Thule', 'Africa/Banjul', 'Africa/Conakry', 'America/Guadeloupe', 'Africa/Malabo', 'Europe/Athens', 'Atlantic/South_Georgia', 'America/Guatemala', 'Pacific/Guam', 'Africa/Bissau', 'America/Guyana', 'Asia/Hong_Kong', 'America/Tegucigalpa', 'Europe/Zagreb', 'America/Port-au-Prince', 'Europe/Budapest', 'Asia/Jakarta', 'Asia/Pontianak', 'Asia/Makassar', 'Asia/Jayapura', 'Europe/Dublin', 'Asia/Jerusalem', 'Europe/Isle_of_Man', 'Asia/Kolkata', 'Indian/Chagos', 'Asia/Baghdad', 'Asia/Tehran', 'Atlantic/Reykjavik', 'Europe/Rome', 'Europe/Jersey', 'America/Jamaica', 'Asia/Amman', 'Asia/Tokyo', 'Africa/Nairobi', 'Asia/Bishkek', 'Asia/Phnom_Penh', 'Pacific/Tarawa', 'Pacific/Enderbury', 'Pacific/Kiritimati', 'Indian/Comoro', 'America/St_Kitts', 'Asia/Pyongyang', 'Asia/Seoul', 'Asia/Kuwait', 'America/Cayman', 'Asia/Almaty', 'Asia/Qyzylorda', 'Asia/Aqtobe', 'Asia/Aqtau', 'Asia/Oral', 'Asia/Vientiane', 'Asia/Beirut', 'America/St_Lucia', 'Europe/Vaduz', 'Asia/Colombo', 'Africa/Monrovia', 'Africa/Maseru', 'Europe/Vilnius', 'Europe/Luxembourg', 'Europe/Riga', 'Africa/Tripoli', 'Africa/Casablanca', 'Europe/Monaco', 'Europe/Chisinau', 'Europe/Podgorica', 'America/Marigot', 'Indian/Antananarivo', 'Pacific/Majuro', 'Pacific/Kwajalein', 'Europe/Skopje', 'Africa/Bamako', 'Asia/Rangoon', 'Asia/Ulaanbaatar', 'Asia/Hovd', 'Asia/Choibalsan', 'Asia/Macau', 'Pacific/Saipan', 'America/Martinique', 'Africa/Nouakchott', 'America/Montserrat', 'Europe/Malta', 'Indian/Mauritius', 'Indian/Maldives', 'Africa/Blantyre', 'America/Mexico_City', 'America/Cancun', 'America/Merida', 'America/Monterrey', 'America/Matamoros', 'America/Mazatlan', 'America/Chihuahua', 'America/Ojinaga', 'America/Hermosillo', 'America/Tijuana', 'America/Santa_Isabel', 'America/Bahia_Banderas', 'Asia/Kuala_Lumpur', 'Asia/Kuching', 'Africa/Maputo', 'Africa/Windhoek', 'Pacific/Noumea', 'Africa/Niamey', 'Pacific/Norfolk', 'Africa/Lagos', 'America/Managua', 'Europe/Amsterdam', 'Europe/Oslo', 'Asia/Kathmandu', 'Pacific/Nauru', 'Pacific/Niue', 'Pacific/Auckland', 'Pacific/Chatham', 'Asia/Muscat', 'America/Panama', 'America/Lima', 'Pacific/Tahiti', 'Pacific/Marquesas', 'Pacific/Gambier', 'Pacific/Port_Moresby', 'Asia/Manila', 'Asia/Karachi', 'Europe/Warsaw', 'America/Miquelon', 'Pacific/Pitcairn', 'America/Puerto_Rico', 'Asia/Gaza', 'Asia/Hebron', 'Europe/Lisbon', 'Atlantic/Madeira', 'Atlantic/Azores', 'Pacific/Palau', 'America/Asuncion', 'Asia/Qatar', 'Indian/Reunion', 'Europe/Bucharest', 'Europe/Belgrade', 'Europe/Kaliningrad', 'Europe/Moscow', 'Europe/Volgograd', 'Europe/Samara', 'Asia/Yekaterinburg', 'Asia/Omsk', 'Asia/Novosibirsk', 'Asia/Novokuznetsk', 'Asia/Krasnoyarsk', 'Asia/Irkutsk', 'Asia/Yakutsk', 'Asia/Khandyga', 'Asia/Vladivostok', 'Asia/Sakhalin', 'Asia/Ust-Nera', 'Asia/Magadan', 'Asia/Kamchatka', 'Asia/Anadyr', 'Africa/Kigali', 'Asia/Riyadh', 'Pacific/Guadalcanal', 'Indian/Mahe', 'Africa/Khartoum', 'Europe/Stockholm', 'Asia/Singapore', 'Atlantic/St_Helena', 'Europe/Ljubljana', 'Arctic/Longyearbyen', 'Europe/Bratislava', 'Africa/Freetown', 'Europe/San_Marino', 'Africa/Dakar', 'Africa/Mogadishu', 'America/Paramaribo', 'Africa/Juba', 'Africa/Sao_Tome', 'America/El_Salvador', 'America/Lower_Princes', 'Asia/Damascus', 'Africa/Mbabane', 'America/Grand_Turk', 'Africa/Ndjamena', 'Indian/Kerguelen', 'Africa/Lome', 'Asia/Bangkok', 'Asia/Dushanbe', 'Pacific/Fakaofo', 'Asia/Dili', 'Asia/Ashgabat', 'Africa/Tunis', 'Pacific/Tongatapu', 'Europe/Istanbul', 'America/Port_of_Spain', 'Pacific/Funafuti', 'Asia/Taipei', 'Africa/Dar_es_Salaam', 'Europe/Kiev', 'Europe/Uzhgorod', 'Europe/Zaporozhye', 'Europe/Simferopol', 'Africa/Kampala', 'Pacific/Johnston', 'Pacific/Midway', 'Pacific/Wake', 'America/New_York', 'America/Detroit', 'America/Kentucky/Louisville', 'America/Kentucky/Monticello', 'America/Indiana/Indianapolis', 'America/Indiana/Vincennes', 'America/Indiana/Winamac', 'America/Indiana/Marengo', 'America/Indiana/Petersburg', 'America/Indiana/Vevay', 'America/Chicago', 'America/Indiana/Tell_City', 'America/Indiana/Knox', 'America/Menominee', 'America/North_Dakota/Center', 'America/North_Dakota/New_Salem', 'America/North_Dakota/Beulah', 'America/Denver', 'America/Boise', 'America/Shiprock', 'America/Phoenix', 'America/Los_Angeles', 'America/Anchorage', 'America/Juneau', 'America/Sitka', 'America/Yakutat', 'America/Nome', 'America/Adak', 'America/Metlakatla', 'Pacific/Honolulu', 'America/Montevideo', 'Asia/Samarkand', 'Asia/Tashkent', 'Europe/Vatican', 'America/St_Vincent', 'America/Caracas', 'America/Tortola', 'America/St_Thomas', 'Asia/Ho_Chi_Minh', 'Pacific/Efate', 'Pacific/Wallis', 'Pacific/Apia', 'Asia/Aden', 'Indian/Mayotte', 'Africa/Johannesburg', 'Africa/Lusaka', 'Africa/Harare'],

	unix_time: function() {
		return this.integer(0, 1462369607);
	},

	moment: function() {
		return moment.unix(this.unix_time);
	},

	date: function(format) {
		format = format || 'YYYY-MM-DD';
		return this.moment.format(format);
	},

	time: function(format) {
		format = format || 'HH:mm:ss';
		return this.moment.format(format);
	},

	century: function() {
		return this.random_element(this.centuries);
	},

	am_pm: function() {
		return this.random_element(['am', 'pm']);
	},

	day_of_year: function() {
		return this.moment.dayOfYear();
	},

	day_of_month: function() {
		return this.moment.format('D');
	},

	day_of_week: function() {
		return this.moment.format('d');
	},

	month_number: function() {
		return this.moment.format('M');
	},

	month_name: function() {
		return this.moment.format('MMMM');
	},

	year: function() {
		return this.moment.format('YYYY');
	},

	timezone: function() {
		return this.random_element(this.timezones);
	}
};

module.exports = provider;

},{"moment":3}],9:[function(require,module,exports){
var provider = {
	states: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],

	state_abbrs: ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'],

	state: function() {
		return this.random_element(this.states);
	},

	state_abbr: function() {
		return this.random_element(this.state_abbrs);
	}
};

module.exports = provider;

},{}],10:[function(require,module,exports){
var provider = {
	top_level_domains: ['co.uk', 'com', 'us', 'net', 'ca', 'biz', 'info', 'name', 'io', 'org', 'biz', 'tv', 'me'],

	free_email_domains: ['gmail.com', 'yahoo.com', 'hotmail.com'],

	email_formats: [
		'{{username}}@{{domain}}',
		'{{username}}@{{free_email_domain}}'
	],

	url_formats: [
		'http://www.{{domain}}/',
		'http://{{domain}}/'
	],

	domain_formats: [
		'{{first_name}}.{{top_level_domain}}',
		'{{last_name}}.{{top_level_domain}}'
	],

	user_agents: [
		'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/600.2.5 (KHTML, like Gecko) Version/8.0.2 Safari/600.2.5',
		'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0',
		'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 8_1_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12B440 Safari/600.1.4',
		'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
		'Mozilla/5.0 (Windows NT 6.3; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:34.0) Gecko/20100101 Firefox/34.0',
		'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:34.0) Gecko/20100101 Firefox/34.0',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:34.0) Gecko/20100101 Firefox/34.0',
		'Mozilla/5.0 (Windows NT 6.1; rv:34.0) Gecko/20100101 Firefox/34.0',
		'Mozilla/5.0 (iPad; CPU OS 8_1_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12B440 Safari/600.1.4',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/600.2.5 (KHTML, like Gecko) Version/7.1.2 Safari/537.85.11',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/600.1.25 (KHTML, like Gecko) QuickLook/5.0',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 7_1_2 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D257 Safari/9537.53',
		'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko',
		'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (X11; Linux x86_64; rv:34.0) Gecko/20100101 Firefox/34.0',
		'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/600.1.25 (KHTML, like Gecko) Version/8.0 Safari/600.1.25',
		'Mozilla/5.0 (Windows NT 5.1; rv:34.0) Gecko/20100101 Firefox/34.0',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/600.1.17 (KHTML, like Gecko) Version/7.1 Safari/537.85.10',
		'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)',
		'Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko',
		'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10) AppleWebKit/600.1.25 (KHTML, like Gecko) Version/8.0 Safari/600.1.25',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.59.10 (KHTML, like Gecko) Version/5.1.9 Safari/534.59.10',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.78.2 (KHTML, like Gecko) Version/6.1.6 Safari/537.78.2',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 8_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12B411 Safari/600.1.4',
		'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/39.0.2171.65 Chrome/39.0.2171.65 Safari/537.36',
		'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:34.0) Gecko/20100101 Firefox/34.0',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (Windows NT 6.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.10 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.10',
		'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:33.0) Gecko/20100101 Firefox/33.0',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (iPad; CPU OS 7_1_2 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D257 Safari/9537.53',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
		'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 8_1_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12B435 Safari/600.1.4',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12A405 Safari/600.1.4',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.78.2 (KHTML, like Gecko) Version/7.0.6 Safari/537.78.2',
		'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:34.0) Gecko/20100101 Firefox/34.0',
		'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:34.0) Gecko/20100101 Firefox/34.0',
		'Mozilla/5.0 (Windows NT 6.0; rv:34.0) Gecko/20100101 Firefox/34.0',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 7_1_1 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D201 Safari/9537.53',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 8_1_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12B436 Safari/600.1.4',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.45 Safari/537.36',
		'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 8_1_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) CriOS/39.0.2171.50 Mobile/12B440 Safari/600.1.4',
		'Mozilla/5.0 (Windows NT 6.2; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0',
		'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (iPad; CPU OS 8_1_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12B435 Safari/600.1.4',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/600.1.17 (KHTML, like Gecko) Version/6.2 Safari/537.85.10',
		'Mozilla/5.0 (iPad; CPU OS 8_1_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) CriOS/39.0.2171.50 Mobile/12B440 Safari/600.1.4',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/600.2.5 (KHTML, like Gecko) Version/6.2.2 Safari/537.85.11',
		'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 8_1_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) GSA/5.1.42378 Mobile/12B440 Safari/600.1.4',
		'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:35.0) Gecko/20100101 Firefox/35.0',
		'Mozilla/5.0 (X11; Linux x86_64; rv:31.0) Gecko/20100101 Firefox/31.0',
		'Mozilla/5.0 (Linux; Android 5.0.1; Nexus 5 Build/LRX22C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.93 Mobile Safari/537.36',
		'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
		'Mozilla/5.0 (iPad; CPU OS 8_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12B410 Safari/600.1.4',
		'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:33.0) Gecko/20100101 Firefox/33.0'
	],

	free_email_domain: function() {
		return this.random_element(this.free_email_domains);
	},

	top_level_domain: function() {
		return this.random_element(this.top_level_domains);
	},

	domain: function() {
		return this.populate_one_of(this.domain_formats);
	},

	email: function() {
		return this.populate_one_of(this.email_formats);
	},

	url: function() {
		return this.populate_one_of(this.url_formats);
	},

	ip: function() {
		return [this.integer(0, 255), this.integer(0, 255), this.integer(0, 255), this.integer(0, 255)].join('.');
	},

	user_agent: function () {
		return this.random_element(this.user_agents);
	}
};

module.exports = provider;

},{}],11:[function(require,module,exports){
var number = require('./number');

var provider = {
	language_codes: ['cn', 'de', 'en', 'es', 'fr', 'it', 'pt', 'ru'],

	country_codes: ['CA', 'CN', 'DE', 'ES', 'FR', 'IE', 'IN', 'IT', 'MX', 'PT', 'RU', 'GB', 'US'],

	locales: ['aa_DJ', 'aa_ER', 'aa_ET', 'af_NA', 'af_ZA', 'ak_GH', 'am_ET', 'ar_AE', 'ar_BH', 'ar_DZ', 'ar_EG', 'ar_IQ', 'ar_JO', 'ar_KW', 'ar_LB', 'ar_LY', 'ar_MA', 'ar_OM', 'ar_QA', 'ar_SA', 'ar_SD', 'ar_SY', 'ar_TN', 'ar_YE', 'as_IN', 'az_AZ', 'be_BY', 'bg_BG', 'bn_BD', 'bn_IN', 'bo_CN', 'bo_IN', 'bs_BA', 'byn_ER', 'ca_ES', 'cch_NG', 'cs_CZ', 'cy_GB', 'da_DK', 'de_AT', 'de_BE', 'de_CH', 'de_DE', 'de_LI', 'de_LU', 'dv_MV', 'dz_BT', 'ee_GH', 'ee_TG', 'el_CY', 'el_GR', 'en_AS', 'en_AU', 'en_BE', 'en_BW', 'en_BZ', 'en_CA', 'en_GB', 'en_GU', 'en_HK', 'en_IE', 'en_IN', 'en_JM', 'en_MH', 'en_MP', 'en_MT', 'en_NA', 'en_NZ', 'en_PH', 'en_PK', 'en_SG', 'en_TT', 'en_UM', 'en_US', 'en_VI', 'en_ZA', 'en_ZW', 'es_AR', 'es_BO', 'es_CL', 'es_CO', 'es_CR', 'es_DO', 'es_EC', 'es_ES', 'es_GT', 'es_HN', 'es_MX', 'es_NI', 'es_PA', 'es_PE', 'es_PR', 'es_PY', 'es_SV', 'es_US', 'es_UY', 'es_VE', 'et_EE', 'eu_ES', 'fa_AF', 'fa_IR', 'fi_FI', 'fil_PH', 'fo_FO', 'fr_BE', 'fr_CA', 'fr_CH', 'fr_FR', 'fr_LU', 'fr_MC', 'fr_SN', 'fur_IT', 'ga_IE', 'gaa_GH', 'gez_ER', 'gez_ET', 'gl_ES', 'gsw_CH', 'gu_IN', 'gv_GB', 'ha_GH', 'ha_NE', 'ha_NG', 'ha_SD', 'haw_US', 'he_IL', 'hi_IN', 'hr_HR', 'hu_HU', 'hy_AM', 'id_ID', 'ig_NG', 'ii_CN', 'is_IS', 'it_CH', 'it_IT', 'ja_JP', 'ka_GE', 'kaj_NG', 'kam_KE', 'kcg_NG', 'kfo_CI', 'kk_KZ', 'kl_GL', 'km_KH', 'kn_IN', 'ko_KR', 'kok_IN', 'kpe_GN', 'kpe_LR', 'ku_IQ', 'ku_IR', 'ku_SY', 'ku_TR', 'kw_GB', 'ky_KG', 'ln_CD', 'ln_CG', 'lo_LA', 'lt_LT', 'lv_LV', 'mk_MK', 'ml_IN', 'mn_CN', 'mn_MN', 'mr_IN', 'ms_BN', 'ms_MY', 'mt_MT', 'my_MM', 'nb_NO', 'nds_DE', 'ne_IN', 'ne_NP', 'nl_BE', 'nl_NL', 'nn_NO', 'nr_ZA', 'nso_ZA', 'ny_MW', 'oc_FR', 'om_ET', 'om_KE', 'or_IN', 'pa_IN', 'pa_PK', 'pl_PL', 'ps_AF', 'pt_BR', 'pt_PT', 'ro_MD', 'ro_RO', 'ru_RU', 'ru_UA', 'rw_RW', 'sa_IN', 'se_FI', 'se_NO', 'sh_BA', 'sh_CS', 'sh_YU', 'si_LK', 'sid_ET', 'sk_SK', 'sl_SI', 'so_DJ', 'so_ET', 'so_KE', 'so_SO', 'sq_AL', 'sr_BA', 'sr_CS', 'sr_ME', 'sr_RS', 'sr_YU', 'ss_SZ', 'ss_ZA', 'st_LS', 'st_ZA', 'sv_FI', 'sv_SE', 'sw_KE', 'sw_TZ', 'syr_SY', 'ta_IN', 'te_IN', 'tg_TJ', 'th_TH', 'ti_ER', 'ti_ET', 'tig_ER', 'tn_ZA', 'to_TO', 'tr_TR', 'trv_TW', 'ts_ZA', 'tt_RU', 'ug_CN', 'uk_UA', 'ur_IN', 'ur_PK', 'uz_AF', 'uz_UZ', 've_ZA', 'vi_VN', 'wal_ET', 'wo_SN', 'xh_ZA', 'yo_NG', 'zh_CN', 'zh_HK', 'zh_MO', 'zh_SG', 'zh_TW', 'zu_ZA'],

	currencies: [{
			symbol: "$",
			name: "US Dollar",
			symbol_native: "$",
			decimal_digits: 2,
			rounding: 0,
			code: "USD",
			name_plural: "US dollars"
		}, {
			symbol: "CA$",
			name: "Canadian Dollar",
			symbol_native: "$",
			decimal_digits: 2,
			rounding: 0,
			code: "CAD",
			name_plural: "Canadian dollars"
		}, {
			symbol: "€",
			name: "Euro",
			symbol_native: "€",
			decimal_digits: 2,
			rounding: 0,
			code: "EUR",
			name_plural: "euros"
		}, {
			symbol: "AED",
			name: "United Arab Emirates Dirham",
			symbol_native: "د.إ.‏",
			decimal_digits: 2,
			rounding: 0,
			code: "AED",
			name_plural: "UAE dirhams"
		}, {
			symbol: "Af",
			name: "Afghan Afghani",
			symbol_native: "؋",
			decimal_digits: 0,
			rounding: 0,
			code: "AFN",
			name_plural: "Afghan Afghanis"
		}, {
			symbol: "ALL",
			name: "Albanian Lek",
			symbol_native: "Lek",
			decimal_digits: 0,
			rounding: 0,
			code: "ALL",
			name_plural: "Albanian lekë"
		}, {
			symbol: "AMD",
			name: "Armenian Dram",
			symbol_native: "դր.",
			decimal_digits: 0,
			rounding: 0,
			code: "AMD",
			name_plural: "Armenian drams"
		}, {
			symbol: "AR$",
			name: "Argentine Peso",
			symbol_native: "$",
			decimal_digits: 2,
			rounding: 0,
			code: "ARS",
			name_plural: "Argentine pesos"
		}, {
			symbol: "AU$",
			name: "Australian Dollar",
			symbol_native: "$",
			decimal_digits: 2,
			rounding: 0,
			code: "AUD",
			name_plural: "Australian dollars"
		}, {
			symbol: "man.",
			name: "Azerbaijani Manat",
			symbol_native: "ман.",
			decimal_digits: 2,
			rounding: 0,
			code: "AZN",
			name_plural: "Azerbaijani manats"
		}, {
			symbol: "KM",
			name: "Bosnia-Herzegovina Convertible Mark",
			symbol_native: "KM",
			decimal_digits: 2,
			rounding: 0,
			code: "BAM",
			name_plural: "Bosnia-Herzegovina convertible marks"
		}, {
			symbol: "Tk",
			name: "Bangladeshi Taka",
			symbol_native: "৳",
			decimal_digits: 2,
			rounding: 0,
			code: "BDT",
			name_plural: "Bangladeshi takas"
		}, {
			symbol: "BGN",
			name: "Bulgarian Lev",
			symbol_native: "лв.",
			decimal_digits: 2,
			rounding: 0,
			code: "BGN",
			name_plural: "Bulgarian leva"
		}, {
			symbol: "BD",
			name: "Bahraini Dinar",
			symbol_native: "د.ب.‏",
			decimal_digits: 3,
			rounding: 0,
			code: "BHD",
			name_plural: "Bahraini dinars"
		}, {
			symbol: "FBu",
			name: "Burundian Franc",
			symbol_native: "FBu",
			decimal_digits: 0,
			rounding: 0,
			code: "BIF",
			name_plural: "Burundian francs"
		}, {
			symbol: "BN$",
			name: "Brunei Dollar",
			symbol_native: "$",
			decimal_digits: 2,
			rounding: 0,
			code: "BND",
			name_plural: "Brunei dollars"
		}, {
			symbol: "Bs",
			name: "Bolivian Boliviano",
			symbol_native: "Bs",
			decimal_digits: 2,
			rounding: 0,
			code: "BOB",
			name_plural: "Bolivian bolivianos"
		}, {
			symbol: "R$",
			name: "Brazilian Real",
			symbol_native: "R$",
			decimal_digits: 2,
			rounding: 0,
			code: "BRL",
			name_plural: "Brazilian reals"
		}, {
			symbol: "BWP",
			name: "Botswanan Pula",
			symbol_native: "P",
			decimal_digits: 2,
			rounding: 0,
			code: "BWP",
			name_plural: "Botswanan pulas"
		}, {
			symbol: "BYR",
			name: "Belarusian Ruble",
			symbol_native: "BYR",
			decimal_digits: 0,
			rounding: 0,
			code: "BYR",
			name_plural: "Belarusian rubles"
		}, {
			symbol: "BZ$",
			name: "Belize Dollar",
			symbol_native: "$",
			decimal_digits: 2,
			rounding: 0,
			code: "BZD",
			name_plural: "Belize dollars"
		}, {
			symbol: "CDF",
			name: "Congolese Franc",
			symbol_native: "FrCD",
			decimal_digits: 2,
			rounding: 0,
			code: "CDF",
			name_plural: "Congolese francs"
		}, {
			symbol: "CHF",
			name: "Swiss Franc",
			symbol_native: "CHF",
			decimal_digits: 2,
			rounding: 0.05,
			code: "CHF",
			name_plural: "Swiss francs"
		}, {
			symbol: "CL$",
			name: "Chilean Peso",
			symbol_native: "$",
			decimal_digits: 0,
			rounding: 0,
			code: "CLP",
			name_plural: "Chilean pesos"
		}, {
			symbol: "CN¥",
			name: "Chinese Yuan",
			symbol_native: "CN¥",
			decimal_digits: 2,
			rounding: 0,
			code: "CNY",
			name_plural: "Chinese yuan"
		}, {
			symbol: "CO$",
			name: "Colombian Peso",
			symbol_native: "$",
			decimal_digits: 0,
			rounding: 0,
			code: "COP",
			name_plural: "Colombian pesos"
		}, {
			symbol: "₡",
			name: "Costa Rican Colón",
			symbol_native: "₡",
			decimal_digits: 0,
			rounding: 0,
			code: "CRC",
			name_plural: "Costa Rican colóns"
		}, {
			symbol: "CV$",
			name: "Cape Verdean Escudo",
			symbol_native: "CV$",
			decimal_digits: 2,
			rounding: 0,
			code: "CVE",
			name_plural: "Cape Verdean escudos"
		}, {
			symbol: "Kč",
			name: "Czech Republic Koruna",
			symbol_native: "Kč",
			decimal_digits: 2,
			rounding: 0,
			code: "CZK",
			name_plural: "Czech Republic korunas"
		}, {
			symbol: "Fdj",
			name: "Djiboutian Franc",
			symbol_native: "Fdj",
			decimal_digits: 0,
			rounding: 0,
			code: "DJF",
			name_plural: "Djiboutian francs"
		}, {
			symbol: "Dkr",
			name: "Danish Krone",
			symbol_native: "kr",
			decimal_digits: 2,
			rounding: 0,
			code: "DKK",
			name_plural: "Danish kroner"
		}, {
			symbol: "RD$",
			name: "Dominican Peso",
			symbol_native: "RD$",
			decimal_digits: 2,
			rounding: 0,
			code: "DOP",
			name_plural: "Dominican pesos"
		}, {
			symbol: "DA",
			name: "Algerian Dinar",
			symbol_native: "د.ج.‏",
			decimal_digits: 2,
			rounding: 0,
			code: "DZD",
			name_plural: "Algerian dinars"
		}, {
			symbol: "Ekr",
			name: "Estonian Kroon",
			symbol_native: "kr",
			decimal_digits: 2,
			rounding: 0,
			code: "EEK",
			name_plural: "Estonian kroons"
		}, {
			symbol: "EGP",
			name: "Egyptian Pound",
			symbol_native: "ج.م.‏",
			decimal_digits: 2,
			rounding: 0,
			code: "EGP",
			name_plural: "Egyptian pounds"
		}, {
			symbol: "Nfk",
			name: "Eritrean Nakfa",
			symbol_native: "Nfk",
			decimal_digits: 2,
			rounding: 0,
			code: "ERN",
			name_plural: "Eritrean nakfas"
		}, {
			symbol: "Br",
			name: "Ethiopian Birr",
			symbol_native: "Br",
			decimal_digits: 2,
			rounding: 0,
			code: "ETB",
			name_plural: "Ethiopian birrs"
		}, {
			symbol: "£",
			name: "British Pound Sterling",
			symbol_native: "£",
			decimal_digits: 2,
			rounding: 0,
			code: "GBP",
			name_plural: "British pounds sterling"
		}, {
			symbol: "GEL",
			name: "Georgian Lari",
			symbol_native: "GEL",
			decimal_digits: 2,
			rounding: 0,
			code: "GEL",
			name_plural: "Georgian laris"
		}, {
			symbol: "GH₵",
			name: "Ghanaian Cedi",
			symbol_native: "GH₵",
			decimal_digits: 2,
			rounding: 0,
			code: "GHS",
			name_plural: "Ghanaian cedis"
		}, {
			symbol: "FG",
			name: "Guinean Franc",
			symbol_native: "FG",
			decimal_digits: 0,
			rounding: 0,
			code: "GNF",
			name_plural: "Guinean francs"
		}, {
			symbol: "GTQ",
			name: "Guatemalan Quetzal",
			symbol_native: "Q",
			decimal_digits: 2,
			rounding: 0,
			code: "GTQ",
			name_plural: "Guatemalan quetzals"
		}, {
			symbol: "HK$",
			name: "Hong Kong Dollar",
			symbol_native: "$",
			decimal_digits: 2,
			rounding: 0,
			code: "HKD",
			name_plural: "Hong Kong dollars"
		}, {
			symbol: "HNL",
			name: "Honduran Lempira",
			symbol_native: "L",
			decimal_digits: 2,
			rounding: 0,
			code: "HNL",
			name_plural: "Honduran lempiras"
		}, {
			symbol: "kn",
			name: "Croatian Kuna",
			symbol_native: "kn",
			decimal_digits: 2,
			rounding: 0,
			code: "HRK",
			name_plural: "Croatian kunas"
		}, {
			symbol: "Ft",
			name: "Hungarian Forint",
			symbol_native: "Ft",
			decimal_digits: 0,
			rounding: 0,
			code: "HUF",
			name_plural: "Hungarian forints"
		}, {
			symbol: "Rp",
			name: "Indonesian Rupiah",
			symbol_native: "Rp",
			decimal_digits: 0,
			rounding: 0,
			code: "IDR",
			name_plural: "Indonesian rupiahs"
		}, {
			symbol: "₪",
			name: "Israeli New Sheqel",
			symbol_native: "₪",
			decimal_digits: 2,
			rounding: 0,
			code: "ILS",
			name_plural: "Israeli new sheqels"
		}, {
			symbol: "Rs",
			name: "Indian Rupee",
			symbol_native: "টকা",
			decimal_digits: 2,
			rounding: 0,
			code: "INR",
			name_plural: "Indian rupees"
		}, {
			symbol: "IQD",
			name: "Iraqi Dinar",
			symbol_native: "د.ع.‏",
			decimal_digits: 0,
			rounding: 0,
			code: "IQD",
			name_plural: "Iraqi dinars"
		}, {
			symbol: "IRR",
			name: "Iranian Rial",
			symbol_native: "﷼",
			decimal_digits: 0,
			rounding: 0,
			code: "IRR",
			name_plural: "Iranian rials"
		}, {
			symbol: "Ikr",
			name: "Icelandic Króna",
			symbol_native: "kr",
			decimal_digits: 0,
			rounding: 0,
			code: "ISK",
			name_plural: "Icelandic krónur"
		}, {
			symbol: "J$",
			name: "Jamaican Dollar",
			symbol_native: "$",
			decimal_digits: 2,
			rounding: 0,
			code: "JMD",
			name_plural: "Jamaican dollars"
		}, {
			symbol: "JD",
			name: "Jordanian Dinar",
			symbol_native: "د.أ.‏",
			decimal_digits: 3,
			rounding: 0,
			code: "JOD",
			name_plural: "Jordanian dinars"
		}, {
			symbol: "¥",
			name: "Japanese Yen",
			symbol_native: "￥",
			decimal_digits: 0,
			rounding: 0,
			code: "JPY",
			name_plural: "Japanese yen"
		}, {
			symbol: "Ksh",
			name: "Kenyan Shilling",
			symbol_native: "Ksh",
			decimal_digits: 2,
			rounding: 0,
			code: "KES",
			name_plural: "Kenyan shillings"
		}, {
			symbol: "KHR",
			name: "Cambodian Riel",
			symbol_native: "៛",
			decimal_digits: 2,
			rounding: 0,
			code: "KHR",
			name_plural: "Cambodian riels"
		}, {
			symbol: "CF",
			name: "Comorian Franc",
			symbol_native: "FC",
			decimal_digits: 0,
			rounding: 0,
			code: "KMF",
			name_plural: "Comorian francs"
		}, {
			symbol: "₩",
			name: "South Korean Won",
			symbol_native: "₩",
			decimal_digits: 0,
			rounding: 0,
			code: "KRW",
			name_plural: "South Korean won"
		}, {
			symbol: "KD",
			name: "Kuwaiti Dinar",
			symbol_native: "د.ك.‏",
			decimal_digits: 3,
			rounding: 0,
			code: "KWD",
			name_plural: "Kuwaiti dinars"
		}, {
			symbol: "KZT",
			name: "Kazakhstani Tenge",
			symbol_native: "тңг.",
			decimal_digits: 2,
			rounding: 0,
			code: "KZT",
			name_plural: "Kazakhstani tenges"
		}, {
			symbol: "LB£",
			name: "Lebanese Pound",
			symbol_native: "ل.ل.‏",
			decimal_digits: 0,
			rounding: 0,
			code: "LBP",
			name_plural: "Lebanese pounds"
		}, {
			symbol: "SLRs",
			name: "Sri Lankan Rupee",
			symbol_native: "SL Re",
			decimal_digits: 2,
			rounding: 0,
			code: "LKR",
			name_plural: "Sri Lankan rupees"
		}, {
			symbol: "Lt",
			name: "Lithuanian Litas",
			symbol_native: "Lt",
			decimal_digits: 2,
			rounding: 0,
			code: "LTL",
			name_plural: "Lithuanian litai"
		}, {
			symbol: "Ls",
			name: "Latvian Lats",
			symbol_native: "Ls",
			decimal_digits: 2,
			rounding: 0,
			code: "LVL",
			name_plural: "Latvian lati"
		}, {
			symbol: "LD",
			name: "Libyan Dinar",
			symbol_native: "د.ل.‏",
			decimal_digits: 3,
			rounding: 0,
			code: "LYD",
			name_plural: "Libyan dinars"
		}, {
			symbol: "MAD",
			name: "Moroccan Dirham",
			symbol_native: "د.م.‏",
			decimal_digits: 2,
			rounding: 0,
			code: "MAD",
			name_plural: "Moroccan dirhams"
		}, {
			symbol: "MDL",
			name: "Moldovan Leu",
			symbol_native: "MDL",
			decimal_digits: 2,
			rounding: 0,
			code: "MDL",
			name_plural: "Moldovan lei"
		}, {
			symbol: "MGA",
			name: "Malagasy Ariary",
			symbol_native: "MGA",
			decimal_digits: 0,
			rounding: 0,
			code: "MGA",
			name_plural: "Malagasy Ariaries"
		}, {
			symbol: "MKD",
			name: "Macedonian Denar",
			symbol_native: "MKD",
			decimal_digits: 2,
			rounding: 0,
			code: "MKD",
			name_plural: "Macedonian denari"
		}, {
			symbol: "MMK",
			name: "Myanma Kyat",
			symbol_native: "K",
			decimal_digits: 0,
			rounding: 0,
			code: "MMK",
			name_plural: "Myanma kyats"
		}, {
			symbol: "MOP$",
			name: "Macanese Pataca",
			symbol_native: "MOP$",
			decimal_digits: 2,
			rounding: 0,
			code: "MOP",
			name_plural: "Macanese patacas"
		}, {
			symbol: "MURs",
			name: "Mauritian Rupee",
			symbol_native: "MURs",
			decimal_digits: 0,
			rounding: 0,
			code: "MUR",
			name_plural: "Mauritian rupees"
		}, {
			symbol: "MX$",
			name: "Mexican Peso",
			symbol_native: "$",
			decimal_digits: 2,
			rounding: 0,
			code: "MXN",
			name_plural: "Mexican pesos"
		}, {
			symbol: "RM",
			name: "Malaysian Ringgit",
			symbol_native: "RM",
			decimal_digits: 2,
			rounding: 0,
			code: "MYR",
			name_plural: "Malaysian ringgits"
		}, {
			symbol: "MTn",
			name: "Mozambican Metical",
			symbol_native: "MTn",
			decimal_digits: 2,
			rounding: 0,
			code: "MZN",
			name_plural: "Mozambican meticals"
		}, {
			symbol: "N$",
			name: "Namibian Dollar",
			symbol_native: "N$",
			decimal_digits: 2,
			rounding: 0,
			code: "NAD",
			name_plural: "Namibian dollars"
		}, {
			symbol: "₦",
			name: "Nigerian Naira",
			symbol_native: "₦",
			decimal_digits: 2,
			rounding: 0,
			code: "NGN",
			name_plural: "Nigerian nairas"
		}, {
			symbol: "C$",
			name: "Nicaraguan Córdoba",
			symbol_native: "C$",
			decimal_digits: 2,
			rounding: 0,
			code: "NIO",
			name_plural: "Nicaraguan córdobas"
		}, {
			symbol: "Nkr",
			name: "Norwegian Krone",
			symbol_native: "kr",
			decimal_digits: 2,
			rounding: 0,
			code: "NOK",
			name_plural: "Norwegian kroner"
		}, {
			symbol: "NPRs",
			name: "Nepalese Rupee",
			symbol_native: "नेरू",
			decimal_digits: 2,
			rounding: 0,
			code: "NPR",
			name_plural: "Nepalese rupees"
		}, {
			symbol: "NZ$",
			name: "New Zealand Dollar",
			symbol_native: "$",
			decimal_digits: 2,
			rounding: 0,
			code: "NZD",
			name_plural: "New Zealand dollars"
		}, {
			symbol: "OMR",
			name: "Omani Rial",
			symbol_native: "ر.ع.‏",
			decimal_digits: 3,
			rounding: 0,
			code: "OMR",
			name_plural: "Omani rials"
		}, {
			symbol: "B/.",
			name: "Panamanian Balboa",
			symbol_native: "B/.",
			decimal_digits: 2,
			rounding: 0,
			code: "PAB",
			name_plural: "Panamanian balboas"
		}, {
			symbol: "S/.",
			name: "Peruvian Nuevo Sol",
			symbol_native: "S/.",
			decimal_digits: 2,
			rounding: 0,
			code: "PEN",
			name_plural: "Peruvian nuevos soles"
		}, {
			symbol: "₱",
			name: "Philippine Peso",
			symbol_native: "₱",
			decimal_digits: 2,
			rounding: 0,
			code: "PHP",
			name_plural: "Philippine pesos"
		}, {
			symbol: "PKRs",
			name: "Pakistani Rupee",
			symbol_native: "₨",
			decimal_digits: 0,
			rounding: 0,
			code: "PKR",
			name_plural: "Pakistani rupees"
		}, {
			symbol: "zł",
			name: "Polish Zloty",
			symbol_native: "zł",
			decimal_digits: 2,
			rounding: 0,
			code: "PLN",
			name_plural: "Polish zlotys"
		}, {
			symbol: "₲",
			name: "Paraguayan Guarani",
			symbol_native: "₲",
			decimal_digits: 0,
			rounding: 0,
			code: "PYG",
			name_plural: "Paraguayan guaranis"
		}, {
			symbol: "QR",
			name: "Qatari Rial",
			symbol_native: "ر.ق.‏",
			decimal_digits: 2,
			rounding: 0,
			code: "QAR",
			name_plural: "Qatari rials"
		}, {
			symbol: "RON",
			name: "Romanian Leu",
			symbol_native: "RON",
			decimal_digits: 2,
			rounding: 0,
			code: "RON",
			name_plural: "Romanian lei"
		}, {
			symbol: "din.",
			name: "Serbian Dinar",
			symbol_native: "дин.",
			decimal_digits: 0,
			rounding: 0,
			code: "RSD",
			name_plural: "Serbian dinars"
		}, {
			symbol: "RUB",
			name: "Russian Ruble",
			symbol_native: "руб.",
			decimal_digits: 2,
			rounding: 0,
			code: "RUB",
			name_plural: "Russian rubles"
		}, {
			symbol: "RWF",
			name: "Rwandan Franc",
			symbol_native: "FR",
			decimal_digits: 0,
			rounding: 0,
			code: "RWF",
			name_plural: "Rwandan francs"
		}, {
			symbol: "SR",
			name: "Saudi Riyal",
			symbol_native: "ر.س.‏",
			decimal_digits: 2,
			rounding: 0,
			code: "SAR",
			name_plural: "Saudi riyals"
		}, {
			symbol: "SDG",
			name: "Sudanese Pound",
			symbol_native: "SDG",
			decimal_digits: 2,
			rounding: 0,
			code: "SDG",
			name_plural: "Sudanese pounds"
		}, {
			symbol: "Skr",
			name: "Swedish Krona",
			symbol_native: "kr",
			decimal_digits: 2,
			rounding: 0,
			code: "SEK",
			name_plural: "Swedish kronor"
		}, {
			symbol: "S$",
			name: "Singapore Dollar",
			symbol_native: "$",
			decimal_digits: 2,
			rounding: 0,
			code: "SGD",
			name_plural: "Singapore dollars"
		}, {
			symbol: "Ssh",
			name: "Somali Shilling",
			symbol_native: "Ssh",
			decimal_digits: 0,
			rounding: 0,
			code: "SOS",
			name_plural: "Somali shillings"
		}, {
			symbol: "SY£",
			name: "Syrian Pound",
			symbol_native: "ل.س.‏",
			decimal_digits: 0,
			rounding: 0,
			code: "SYP",
			name_plural: "Syrian pounds"
		}, {
			symbol: "฿",
			name: "Thai Baht",
			symbol_native: "฿",
			decimal_digits: 2,
			rounding: 0,
			code: "THB",
			name_plural: "Thai baht"
		}, {
			symbol: "DT",
			name: "Tunisian Dinar",
			symbol_native: "د.ت.‏",
			decimal_digits: 3,
			rounding: 0,
			code: "TND",
			name_plural: "Tunisian dinars"
		}, {
			symbol: "T$",
			name: "Tongan Paʻanga",
			symbol_native: "T$",
			decimal_digits: 2,
			rounding: 0,
			code: "TOP",
			name_plural: "Tongan paʻanga"
		}, {
			symbol: "TL",
			name: "Turkish Lira",
			symbol_native: "TL",
			decimal_digits: 2,
			rounding: 0,
			code: "TRY",
			name_plural: "Turkish Lira"
		}, {
			symbol: "TT$",
			name: "Trinidad and Tobago Dollar",
			symbol_native: "$",
			decimal_digits: 2,
			rounding: 0,
			code: "TTD",
			name_plural: "Trinidad and Tobago dollars"
		}, {
			symbol: "NT$",
			name: "New Taiwan Dollar",
			symbol_native: "NT$",
			decimal_digits: 2,
			rounding: 0,
			code: "TWD",
			name_plural: "New Taiwan dollars"
		}, {
			symbol: "TSh",
			name: "Tanzanian Shilling",
			symbol_native: "TSh",
			decimal_digits: 0,
			rounding: 0,
			code: "TZS",
			name_plural: "Tanzanian shillings"
		}, {
			symbol: "₴",
			name: "Ukrainian Hryvnia",
			symbol_native: "₴",
			decimal_digits: 2,
			rounding: 0,
			code: "UAH",
			name_plural: "Ukrainian hryvnias"
		}, {
			symbol: "USh",
			name: "Ugandan Shilling",
			symbol_native: "USh",
			decimal_digits: 0,
			rounding: 0,
			code: "UGX",
			name_plural: "Ugandan shillings"
		}, {
			symbol: "$U",
			name: "Uruguayan Peso",
			symbol_native: "$",
			decimal_digits: 2,
			rounding: 0,
			code: "UYU",
			name_plural: "Uruguayan pesos"
		}, {
			symbol: "UZS",
			name: "Uzbekistan Som",
			symbol_native: "UZS",
			decimal_digits: 0,
			rounding: 0,
			code: "UZS",
			name_plural: "Uzbekistan som"
		}, {
			symbol: "Bs.F.",
			name: "Venezuelan Bolívar",
			symbol_native: "Bs.F.",
			decimal_digits: 2,
			rounding: 0,
			code: "VEF",
			name_plural: "Venezuelan bolívars"
		}, {
			symbol: "₫",
			name: "Vietnamese Dong",
			symbol_native: "₫",
			decimal_digits: 0,
			rounding: 0,
			code: "VND",
			name_plural: "Vietnamese dong"
		}, {
			symbol: "FCFA",
			name: "CFA Franc BEAC",
			symbol_native: "FCFA",
			decimal_digits: 0,
			rounding: 0,
			code: "XAF",
			name_plural: "CFA francs BEAC"
		}, {
			symbol: "CFA",
			name: "CFA Franc BCEAO",
			symbol_native: "CFA",
			decimal_digits: 0,
			rounding: 0,
			code: "XOF",
			name_plural: "CFA francs BCEAO"
		}, {
			symbol: "YR",
			name: "Yemeni Rial",
			symbol_native: "ر.ي.‏",
			decimal_digits: 0,
			rounding: 0,
			code: "YER",
			name_plural: "Yemeni rials"
		}, {
			symbol: "R",
			name: "South African Rand",
			symbol_native: "R",
			decimal_digits: 2,
			rounding: 0,
			code: "ZAR",
			name_plural: "South African rand"
		}, {
			symbol: "ZK",
			name: "Zambian Kwacha",
			symbol_native: "ZK",
			decimal_digits: 0,
			rounding: 0,
			code: "ZMK",
			name_plural: "Zambian kwachas"
		}],
	/**
	 * MIME types from the apache.org file. Some types are truncated.
	 *
	 * @link http://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types
	 */
	mime_types: {
		'application/atom+xml': 'atom',
		'application/ecmascript': 'ecma',
		'application/emma+xml': 'emma',
		'application/epub+zip': 'epub',
		'application/java-archive': 'jar',
		'application/java-vm': 'class',
		'application/javascript': 'js',
		'application/json': 'json',
		'application/jsonml+json': 'jsonml',
		'application/lost+xml': 'lostxml',
		'application/mathml+xml': 'mathml',
		'application/mets+xml': 'mets',
		'application/mods+xml': 'mods',
		'application/mp4': 'mp4s',
		'application/msword': ['doc', 'dot'],
		'application/octet-stream': [
			'bin',
			'dms',
			'lrf',
			'mar',
			'so',
			'dist',
			'distz',
			'pkg',
			'bpk',
			'dump',
			'elc',
			'deploy'
		],
		'application/ogg': 'ogx',
		'application/omdoc+xml': 'omdoc',
		'application/pdf': 'pdf',
		'application/pgp-encrypted': 'pgp',
		'application/pgp-signature': ['asc', 'sig'],
		'application/pkix-pkipath': 'pkipath',
		'application/pkixcmp': 'pki',
		'application/pls+xml': 'pls',
		'application/postscript': ['ai', 'eps', 'ps'],
		'application/pskc+xml': 'pskcxml',
		'application/rdf+xml': 'rdf',
		'application/reginfo+xml': 'rif',
		'application/rss+xml': 'rss',
		'application/rtf': 'rtf',
		'application/sbml+xml': 'sbml',
		'application/vnd.adobe.air-application-installer-package+zip': 'air',
		'application/vnd.adobe.xdp+xml': 'xdp',
		'application/vnd.adobe.xfdf': 'xfdf',
		'application/vnd.ahead.space': 'ahead',
		'application/vnd.dart': 'dart',
		'application/vnd.data-vision.rdz': 'rdz',
		'application/vnd.dece.data': ['uvf', 'uvvf', 'uvd', 'uvvd'],
		'application/vnd.dece.ttml+xml': ['uvt', 'uvvt'],
		'application/vnd.dece.unspecified': ['uvx', 'uvvx'],
		'application/vnd.dece.zip': ['uvz', 'uvvz'],
		'application/vnd.denovo.fcselayout-link': 'fe_launch',
		'application/vnd.dna': 'dna',
		'application/vnd.dolby.mlp': 'mlp',
		'application/vnd.dpgraph': 'dpg',
		'application/vnd.dreamfactory': 'dfac',
		'application/vnd.ds-keypoint': 'kpxx',
		'application/vnd.dvb.ait': 'ait',
		'application/vnd.dvb.service': 'svc',
		'application/vnd.dynageo': 'geo',
		'application/vnd.ecowin.chart': 'mag',
		'application/vnd.enliven': 'nml',
		'application/vnd.epson.esf': 'esf',
		'application/vnd.epson.msf': 'msf',
		'application/vnd.epson.quickanime': 'qam',
		'application/vnd.epson.salt': 'slt',
		'application/vnd.epson.ssf': 'ssf',
		'application/vnd.ezpix-album': 'ez2',
		'application/vnd.ezpix-package': 'ez3',
		'application/vnd.fdf': 'fdf',
		'application/vnd.fdsn.mseed': 'mseed',
		'application/vnd.fdsn.seed': ['seed', 'dataless'],
		'application/vnd.flographit': 'gph',
		'application/vnd.fluxtime.clip': 'ftc',
		'application/vnd.hal+xml': 'hal',
		'application/vnd.hydrostatix.sof-data': 'sfd-hdstx',
		'application/vnd.ibm.minipay': 'mpy',
		'application/vnd.ibm.secure-container': 'sc',
		'application/vnd.iccprofile': ['icc', 'icm'],
		'application/vnd.igloader': 'igl',
		'application/vnd.immervision-ivp': 'ivp',
		'application/vnd.kde.karbon': 'karbon',
		'application/vnd.kde.kchart': 'chrt',
		'application/vnd.kde.kformula': 'kfo',
		'application/vnd.kde.kivio': 'flw',
		'application/vnd.kde.kontour': 'kon',
		'application/vnd.kde.kpresenter': ['kpr', 'kpt'],
		'application/vnd.kde.kspread': 'ksp',
		'application/vnd.kde.kword': ['kwd', 'kwt'],
		'application/vnd.kenameaapp': 'htke',
		'application/vnd.kidspiration': 'kia',
		'application/vnd.kinar': ['kne', 'knp'],
		'application/vnd.koan': ['skp', 'skd', 'skt', 'skm'],
		'application/vnd.kodak-descriptor': 'sse',
		'application/vnd.las.las+xml': 'lasxml',
		'application/vnd.llamagraphics.life-balance.desktop': 'lbd',
		'application/vnd.llamagraphics.life-balance.exchange+xml': 'lbe',
		'application/vnd.lotus-1-2-3': '123',
		'application/vnd.lotus-approach': 'apr',
		'application/vnd.lotus-freelance': 'pre',
		'application/vnd.lotus-notes': 'nsf',
		'application/vnd.lotus-organizer': 'org',
		'application/vnd.lotus-screencam': 'scm',
		'application/vnd.mozilla.xul+xml': 'xul',
		'application/vnd.ms-artgalry': 'cil',
		'application/vnd.ms-cab-compressed': 'cab',
		'application/vnd.ms-excel': [
			'xls',
			'xlm',
			'xla',
			'xlc',
			'xlt',
			'xlw'
		],
		'application/vnd.ms-excel.addin.macroenabled.12': 'xlam',
		'application/vnd.ms-excel.sheet.binary.macroenabled.12': 'xlsb',
		'application/vnd.ms-excel.sheet.macroenabled.12': 'xlsm',
		'application/vnd.ms-excel.template.macroenabled.12': 'xltm',
		'application/vnd.ms-fontobject': 'eot',
		'application/vnd.ms-htmlhelp': 'chm',
		'application/vnd.ms-ims': 'ims',
		'application/vnd.ms-lrm': 'lrm',
		'application/vnd.ms-officetheme': 'thmx',
		'application/vnd.ms-pki.seccat': 'cat',
		'application/vnd.ms-pki.stl': 'stl',
		'application/vnd.ms-powerpoint': ['ppt', 'pps', 'pot'],
		'application/vnd.ms-powerpoint.addin.macroenabled.12': 'ppam',
		'application/vnd.ms-powerpoint.presentation.macroenabled.12': 'pptm',
		'application/vnd.ms-powerpoint.slide.macroenabled.12': 'sldm',
		'application/vnd.ms-powerpoint.slideshow.macroenabled.12': 'ppsm',
		'application/vnd.ms-powerpoint.template.macroenabled.12': 'potm',
		'application/vnd.ms-project': ['mpp', 'mpt'],
		'application/vnd.ms-word.document.macroenabled.12': 'docm',
		'application/vnd.ms-word.template.macroenabled.12': 'dotm',
		'application/vnd.ms-works': ['wps', 'wks', 'wcm', 'wdb'],
		'application/vnd.ms-wpl': 'wpl',
		'application/vnd.ms-xpsdocument': 'xps',
		'application/vnd.mseq': 'mseq',
		'application/vnd.musician': 'mus',
		'application/vnd.oasis.opendocument.chart': 'odc',
		'application/vnd.oasis.opendocument.chart-template': 'otc',
		'application/vnd.oasis.opendocument.database': 'odb',
		'application/vnd.oasis.opendocument.formula': 'odf',
		'application/vnd.oasis.opendocument.formula-template': 'odft',
		'application/vnd.oasis.opendocument.graphics': 'odg',
		'application/vnd.oasis.opendocument.graphics-template': 'otg',
		'application/vnd.oasis.opendocument.image': 'odi',
		'application/vnd.oasis.opendocument.image-template': 'oti',
		'application/vnd.oasis.opendocument.presentation': 'odp',
		'application/vnd.oasis.opendocument.presentation-template': 'otp',
		'application/vnd.oasis.opendocument.spreadsheet': 'ods',
		'application/vnd.oasis.opendocument.spreadsheet-template': 'ots',
		'application/vnd.oasis.opendocument.text': 'odt',
		'application/vnd.oasis.opendocument.text-master': 'odm',
		'application/vnd.oasis.opendocument.text-template': 'ott',
		'application/vnd.oasis.opendocument.text-web': 'oth',
		'application/vnd.olpc-sugar': 'xo',
		'application/vnd.oma.dd2+xml': 'dd2',
		'application/vnd.openofficeorg.extension': 'oxt',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
		'application/vnd.openxmlformats-officedocument.presentationml.slide': 'sldx',
		'application/vnd.openxmlformats-officedocument.presentationml.slideshow': 'ppsx',
		'application/vnd.openxmlformats-officedocument.presentationml.template': 'potx',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.template': 'xltx',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.template': 'dotx',
		'application/vnd.pvi.ptid1': 'ptid',
		'application/vnd.quark.quarkxpress': [
			'qxd',
			'qxt',
			'qwd',
			'qwt',
			'qxl',
			'qxb'
		],
		'application/vnd.realvnc.bed': 'bed',
		'application/vnd.recordare.musicxml': 'mxl',
		'application/vnd.recordare.musicxml+xml': 'musicxml',
		'application/vnd.rig.cryptonote': 'cryptonote',
		'application/vnd.rim.cod': 'cod',
		'application/vnd.rn-realmedia': 'rm',
		'application/vnd.rn-realmedia-vbr': 'rmvb',
		'application/vnd.route66.link66+xml': 'link66',
		'application/vnd.sailingtracker.track': 'st',
		'application/vnd.seemail': 'see',
		'application/vnd.sema': 'sema',
		'application/vnd.semd': 'semd',
		'application/vnd.semf': 'semf',
		'application/vnd.shana.informed.formdata': 'ifm',
		'application/vnd.shana.informed.formtemplate': 'itp',
		'application/vnd.shana.informed.interchange': 'iif',
		'application/vnd.shana.informed.package': 'ipk',
		'application/vnd.simtech-mindmapper': ['twd', 'twds'],
		'application/vnd.smaf': 'mmf',
		'application/vnd.stepmania.stepchart': 'sm',
		'application/vnd.sun.xml.calc': 'sxc',
		'application/vnd.sun.xml.calc.template': 'stc',
		'application/vnd.sun.xml.draw': 'sxd',
		'application/vnd.sun.xml.draw.template': 'std',
		'application/vnd.sun.xml.impress': 'sxi',
		'application/vnd.sun.xml.impress.template': 'sti',
		'application/vnd.sun.xml.math': 'sxm',
		'application/vnd.sun.xml.writer': 'sxw',
		'application/vnd.sun.xml.writer.global': 'sxg',
		'application/vnd.sun.xml.writer.template': 'stw',
		'application/vnd.sus-calendar': ['sus', 'susp'],
		'application/vnd.svd': 'svd',
		'application/vnd.symbian.install': ['sis', 'sisx'],
		'application/vnd.syncml+xml': 'xsm',
		'application/vnd.syncml.dm+wbxml': 'bdm',
		'application/vnd.syncml.dm+xml': 'xdm',
		'application/vnd.tao.intent-module-archive': 'tao',
		'application/vnd.tcpdump.pcap': ['pcap', 'cap', 'dmp'],
		'application/vnd.tmobile-livetv': 'tmo',
		'application/vnd.trid.tpt': 'tpt',
		'application/vnd.triscape.mxs': 'mxs',
		'application/vnd.trueapp': 'tra',
		'application/vnd.ufdl': ['ufd', 'ufdl'],
		'application/vnd.uiq.theme': 'utz',
		'application/vnd.umajin': 'umj',
		'application/vnd.unity': 'unityweb',
		'application/vnd.uoml+xml': 'uoml',
		'application/vnd.vcx': 'vcx',
		'application/vnd.visio': ['vsd', 'vst', 'vss', 'vsw'],
		'application/vnd.visionary': 'vis',
		'application/vnd.vsf': 'vsf',
		'application/vnd.wap.wbxml': 'wbxml',
		'application/vnd.wap.wmlc': 'wmlc',
		'application/vnd.wap.wmlscriptc': 'wmlsc',
		'application/vnd.webturbo': 'wtb',
		'application/vnd.wolfram.player': 'nbp',
		'application/vnd.wordperfect': 'wpd',
		'application/vnd.wqd': 'wqd',
		'application/vnd.wt.stf': 'stf',
		'application/vnd.xara': 'xar',
		'application/vnd.xfdl': 'xfdl',
		'application/voicexml+xml': 'vxml',
		'application/widget': 'wgt',
		'application/winhlp': 'hlp',
		'application/wsdl+xml': 'wsdl',
		'application/wspolicy+xml': 'wspolicy',
		'application/x-7z-compressed': '7z',
		'application/x-bittorrent': 'torrent',
		'application/x-blorb': ['blb', 'blorb'],
		'application/x-bzip': 'bz',
		'application/x-cdlink': 'vcd',
		'application/x-cfs-compressed': 'cfs',
		'application/x-chat': 'chat',
		'application/x-chess-pgn': 'pgn',
		'application/x-conference': 'nsc',
		'application/x-cpio': 'cpio',
		'application/x-csh': 'csh',
		'application/x-debian-package': ['deb', 'udeb'],
		'application/x-dgc-compressed': 'dgc',
		'application/x-director': [
			'dir',
			'dcr',
			'dxr',
			'cst',
			'cct',
			'cxt',
			'w3d',
			'fgd',
			'swa'
		],
		'application/x-font-ttf': ['ttf', 'ttc'],
		'application/x-font-type1': ['pfa', 'pfb', 'pfm', 'afm'],
		'application/x-font-woff': 'woff',
		'application/x-freearc': 'arc',
		'application/x-futuresplash': 'spl',
		'application/x-gca-compressed': 'gca',
		'application/x-glulx': 'ulx',
		'application/x-gnumeric': 'gnumeric',
		'application/x-gramps-xml': 'gramps',
		'application/x-gtar': 'gtar',
		'application/x-hdf': 'hdf',
		'application/x-install-instructions': 'install',
		'application/x-iso9660-image': 'iso',
		'application/x-java-jnlp-file': 'jnlp',
		'application/x-latex': 'latex',
		'application/x-lzh-compressed': ['lzh', 'lha'],
		'application/x-mie': 'mie',
		'application/x-mobipocket-ebook': ['prc', 'mobi'],
		'application/x-ms-application': 'application',
		'application/x-ms-shortcut': 'lnk',
		'application/x-ms-wmd': 'wmd',
		'application/x-ms-wmz': 'wmz',
		'application/x-ms-xbap': 'xbap',
		'application/x-msaccess': 'mdb',
		'application/x-msbinder': 'obd',
		'application/x-mscardfile': 'crd',
		'application/x-msclip': 'clp',
		'application/x-msdownload': ['exe', 'dll', 'com', 'bat', 'msi'],
		'application/x-msmediaview': [
			'mvb',
			'm13',
			'm14'
		],
		'application/x-msmetafile': ['wmf', 'wmz', 'emf', 'emz'],
		'application/x-rar-compressed': 'rar',
		'application/x-research-info-systems': 'ris',
		'application/x-sh': 'sh',
		'application/x-shar': 'shar',
		'application/x-shockwave-flash': 'swf',
		'application/x-silverlight-app': 'xap',
		'application/x-sql': 'sql',
		'application/x-stuffit': 'sit',
		'application/x-stuffitx': 'sitx',
		'application/x-subrip': 'srt',
		'application/x-sv4cpio': 'sv4cpio',
		'application/x-sv4crc': 'sv4crc',
		'application/x-t3vm-image': 't3',
		'application/x-tads': 'gam',
		'application/x-tar': 'tar',
		'application/x-tcl': 'tcl',
		'application/x-tex': 'tex',
		'application/x-tex-tfm': 'tfm',
		'application/x-texinfo': ['texinfo', 'texi'],
		'application/x-tgif': 'obj',
		'application/x-ustar': 'ustar',
		'application/x-wais-source': 'src',
		'application/x-x509-ca-cert': ['der', 'crt'],
		'application/x-xfig': 'fig',
		'application/x-xliff+xml': 'xlf',
		'application/x-xpinstall': 'xpi',
		'application/x-xz': 'xz',
		'application/x-zmachine': 'z1',
		'application/xaml+xml': 'xaml',
		'application/xcap-diff+xml': 'xdf',
		'application/xenc+xml': 'xenc',
		'application/xhtml+xml': ['xhtml', 'xht'],
		'application/xml': ['xml', 'xsl'],
		'application/xml-dtd': 'dtd',
		'application/xop+xml': 'xop',
		'application/xproc+xml': 'xpl',
		'application/xslt+xml': 'xslt',
		'application/xspf+xml': 'xspf',
		'application/xv+xml': ['mxml', 'xhvml', 'xvml', 'xvm'],
		'application/yang': 'yang',
		'application/yin+xml': 'yin',
		'application/zip': 'zip',
		'audio/adpcm': 'adp',
		'audio/basic': ['au', 'snd'],
		'audio/midi': ['mid', 'midi', 'kar', 'rmi'],
		'audio/mp4': 'mp4a',
		'audio/mpeg': [
			'mpga',
			'mp2',
			'mp2a',
			'mp3',
			'm2a',
			'm3a'
		],
		'audio/ogg': ['oga', 'ogg', 'spx'],
		'audio/vnd.dece.audio': ['uva', 'uvva'],
		'audio/vnd.rip': 'rip',
		'audio/webm': 'weba',
		'audio/x-aac': 'aac',
		'audio/x-aiff': ['aif', 'aiff', 'aifc'],
		'audio/x-caf': 'caf',
		'audio/x-flac': 'flac',
		'audio/x-matroska': 'mka',
		'audio/x-mpegurl': 'm3u',
		'audio/x-ms-wax': 'wax',
		'audio/x-ms-wma': 'wma',
		'audio/x-pn-realaudio': ['ram', 'ra'],
		'audio/x-pn-realaudio-plugin': 'rmp',
		'audio/x-wav': 'wav',
		'audio/xm': 'xm',
		'image/bmp': 'bmp',
		'image/cgm': 'cgm',
		'image/g3fax': 'g3',
		'image/gif': 'gif',
		'image/ief': 'ief',
		'image/jpeg': ['jpeg', 'jpg', 'jpe'],
		'image/ktx': 'ktx',
		'image/png': 'png',
		'image/prs.btif': 'btif',
		'image/sgi': 'sgi',
		'image/svg+xml': ['svg', 'svgz'],
		'image/tiff': ['tiff', 'tif'],
		'image/vnd.adobe.photoshop': 'psd',
		'image/vnd.dece.graphic': ['uvi', 'uvvi', 'uvg', 'uvvg'],
		'image/vnd.dvb.subtitle': 'sub',
		'image/vnd.djvu': ['djvu', 'djv'],
		'image/vnd.dwg': 'dwg',
		'image/vnd.dxf': 'dxf',
		'image/vnd.fastbidsheet': 'fbs',
		'image/vnd.fpx': 'fpx',
		'image/vnd.fst': 'fst',
		'image/vnd.fujixerox.edmics-mmr': 'mmr',
		'image/vnd.fujixerox.edmics-rlc': 'rlc',
		'image/vnd.ms-modi': 'mdi',
		'image/vnd.ms-photo': 'wdp',
		'image/vnd.net-fpx': 'npx',
		'image/vnd.wap.wbmp': 'wbmp',
		'image/vnd.xiff': 'xif',
		'image/webp': 'webp',
		'image/x-3ds': '3ds',
		'image/x-cmu-raster': 'ras',
		'image/x-cmx': 'cmx',
		'image/x-freehand': ['fh', 'fhc', 'fh4', 'fh5', 'fh7'],
		'image/x-icon': 'ico',
		'image/x-mrsid-image': 'sid',
		'image/x-pcx': 'pcx',
		'image/x-pict': ['pic', 'pct'],
		'image/x-portable-anymap': 'pnm',
		'image/x-portable-bitmap': 'pbm',
		'image/x-portable-graymap': 'pgm',
		'image/x-portable-pixmap': 'ppm',
		'image/x-rgb': 'rgb',
		'image/x-tga': 'tga',
		'image/x-xbitmap': 'xbm',
		'image/x-xpixmap': 'xpm',
		'image/x-xwindowdump': 'xwd',
		'message/rfc822': ['eml', 'mime'],
		'model/iges': ['igs', 'iges'],
		'model/mesh': ['msh', 'mesh', 'silo'],
		'model/vnd.collada+xml': 'dae',
		'model/vnd.dwf': 'dwf',
		'model/vnd.gdl': 'gdl',
		'model/vnd.gtw': 'gtw',
		'model/vnd.mts': 'mts',
		'model/vnd.vtu': 'vtu',
		'model/vrml': ['wrl', 'vrml'],
		'model/x3d+binary': 'x3db',
		'model/x3d+vrml': 'x3dv',
		'model/x3d+xml': 'x3d',
		'text/cache-manifest': 'appcache',
		'text/calendar': ['ics', 'ifb'],
		'text/css': 'css',
		'text/csv': 'csv',
		'text/html': ['html', 'htm'],
		'text/n3': 'n3',
		'text/plain': [
			'txt',
			'text',
			'conf',
			'def',
			'list',
			'log',
			'in'
		],
		'text/prs.lines.tag': 'dsc',
		'text/richtext': 'rtx',
		'text/sgml': ['sgml', 'sgm'],
		'text/tab-separated-values': 'tsv',
		'text/troff': [
			't',
			'tr',
			'roff',
			'man',
			'me',
			'ms'
		],
		'text/turtle': 'ttl',
		'text/uri-list': ['uri', 'uris', 'urls'],
		'text/vcard': 'vcard',
		'text/vnd.curl': 'curl',
		'text/vnd.curl.dcurl': 'dcurl',
		'text/vnd.curl.scurl': 'scurl',
		'text/vnd.curl.mcurl': 'mcurl',
		'text/vnd.dvb.subtitle': 'sub',
		'text/vnd.fly': 'fly',
		'text/vnd.fmi.flexstor': 'flx',
		'text/vnd.graphviz': 'gv',
		'text/vnd.in3d.3dml': '3dml',
		'text/vnd.in3d.spot': 'spot',
		'text/vnd.sun.j2me.app-descriptor': 'jad',
		'text/vnd.wap.wml': 'wml',
		'text/vnd.wap.wmlscript': 'wmls',
		'text/x-asm': ['s', 'asm'],
		'text/x-fortran': ['f', 'for', 'f77', 'f90'],
		'text/x-java-source': 'java',
		'text/x-opml': 'opml',
		'text/x-pascal': ['p', 'pas'],
		'text/x-nfo': 'nfo',
		'text/x-setext': 'etx',
		'text/x-sfv': 'sfv',
		'text/x-uuencode': 'uu',
		'text/x-vcalendar': 'vcs',
		'text/x-vcard': 'vcf',
		'video/3gpp': '3gp',
		'video/3gpp2': '3g2',
		'video/h261': 'h261',
		'video/h263': 'h263',
		'video/h264': 'h264',
		'video/jpeg': 'jpgv',
		'video/jpm': ['jpm', 'jpgm'],
		'video/mj2': 'mj2',
		'video/mp4': 'mp4',
		'video/mpeg': ['mpeg', 'mpg', 'mpe', 'm1v', 'm2v'],
		'video/ogg': 'ogv',
		'video/quicktime': ['qt', 'mov'],
		'video/vnd.dece.hd': ['uvh', 'uvvh'],
		'video/vnd.dece.mobile': ['uvm', 'uvvm'],
		'video/vnd.dece.pd': ['uvp', 'uvvp'],
		'video/vnd.dece.sd': ['uvs', 'uvvs'],
		'video/vnd.dece.video': ['uvv', 'uvvv'],
		'video/vnd.dvb.file': 'dvb',
		'video/vnd.fvt': 'fvt',
		'video/vnd.mpegurl': ['mxu', 'm4u'],
		'video/vnd.ms-playready.media.pyv': 'pyv',
		'video/vnd.uvvu.mp4': ['uvu', 'uvvu'],
		'video/vnd.vivo': 'viv',
		'video/webm': 'webm',
		'video/x-f4v': 'f4v',
		'video/x-fli': 'fli',
		'video/x-flv': 'flv',
		'video/x-m4v': 'm4v',
		'video/x-matroska': ['mkv', 'mk3d', 'mks'],
		'video/x-mng': 'mng',
		'video/x-ms-asf': ['asf', 'asx'],
		'video/x-ms-vob': 'vob',
		'video/x-ms-wm': 'wm',
		'video/x-ms-wmv': 'wmv',
		'video/x-ms-wmx': 'wmx',
		'video/x-ms-wvx': 'wvx',
		'video/x-msvideo': 'avi',
		'video/x-sgi-movie': 'movie'
	},
	
	animals: [
		"alligator",
		"alpaca",
		"ant",
		"antelope",
		"ape",
		"armadillo",
		"baboon",
		"badger",
		"barracuda",
		"bat",
		"bear",
		"beaver",
		"bee",
		"bird",
		"bison",
		"boar",
		"buffalo",
		"butterfly",
		"camel",
		"cat",
		"caterpillar",
		"cattle",
		"chameleon",
		"cheetah",
		"cobra",
		"cockroach",
		"coyote",
		"crab",
		"crane",
		"crocodile",
		"crow",
		"curlew",
		"deer",
		"dinosaur",
		"dog",
		"dolphin",
		"donkey",
		"dotterel",
		"dove",
		"dragonfly",
		"duck",
		"eagle",
		"eel",
		"elk",
		"emu",
		"falcon",
		"fish",
		"flamingo",
		"fly",
		"fox",
		"frog",
		"gaur",
		"gnu",
		"goat",
		"goose",
		"gorilla",
		"gull",
		"hamster",
		"hare",
		"hawk",
		"hedgehog",
		"hippo",
		"hornet",
		"horse",
		"jaguar",
		"jellyfish",
		"kangaroo",
		"koala",
		"lark",
		"leopard",
		"lion",
		"lobster",
		"locust",
		"mongoose",
		"monkey",
		"moose",
		"octopus",
		"otter",
		"owl",
		"oyster",
		"panther",
		"parrot",
		"panda",
		"pig",
		"pigeon",
		"rat",
		"raven",
		"seal",
		"shark",
		"sheep",
		"snail",
		"snake",
		"spider",
		"swan",
		"tiger",
		"toad",
		"turkey",
		"wolf",
		"wombat",
		"zebra",
	],

	locale: function() {
		return this.random_element(this.locales);
	},

	country_code: function() {
		return this.random_element(this.country_codes);
	},

	language_code: function() {
		return this.random_element(this.language_codes);
	},

	currency: function() {
		return this.random_element(this.currencies);
	},

	currency_code: function() {
		return this.random_element(this.currencies).code;
	},

	currency_symbol: function() {
		return this.random_element(this.currencies).symbol;
	},

	currency_name: function() {
		return this.random_element(this.currencies).name;
	},

	mime_type: function() {
		return this.random_key(this.mime_types);
	},

	file_extension: function() {
		var ext = this.random_value(this.mime_types);
		return typeof ext === 'string' ? ext : this.random_element(ext);
	},

	boolean: function() {
		return this.coin_flip;
	},

	uuid: function() {
 		return (b = function (_b) {
			function b(_x) {
				return _b.apply(this, arguments);
			}
			b.toString = function () {
				return _b.toString();
 			};
			return b;
		}(function (a) {
			return a ? (a ^ number.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b);
		}))();
	},
	
	animal: function () {
		return this.random_element(this.animals);
	}
};

module.exports = provider;

},{"./number":12}],12:[function(require,module,exports){
var MersenneTwister = require('mersenne-twister');

// Pseudorandom number generator
var generator = new MersenneTwister();

var array_of = function(n, generator) {
	var result = [];
	for (var i = 0; i < n; ++i) {
		result.push(generator());
	}

	return result;
};

var provider = {
	integer: function(from, to) {
		from = typeof from === 'undefined' ? -1000 : from - 0;
		to   = typeof to   === 'undefined' ? +1000 : to - 0;

		return Math.round(from + (to - from) * this.random);
	},

	digit: function() {
		return Math.abs(this.integer(0) % 10);
	},

	random: function() {
		return generator.random();
	},

	double: function(from, to) {
		from = typeof from === 'undefined' ? -1000 : from - 0;
		to   = typeof to   === 'undefined' ? +1000 : to - 0;

		return from + (to - from) * this.random;
	},

	array_of_digits: function(n) {
		n = n || 7;
		return array_of(n, this._digit);
	},

	array_of_integers: function(n) {
		n = n || 7;
		return array_of(n, this._integer);
	},

	array_of_doubles: function(n) {
		n = n || 7;
		return array_of(n, this._double);
	},

	coin_flip: function() {
		return generator.random() < 0.5;
	},

	seed: function(seed) {
		generator.init_seed(seed);
	}
};

module.exports = provider;

},{"mersenne-twister":2}],13:[function(require,module,exports){
var provider = {
	card_vendors: ['Visa', 'Visa', 'Visa', 'Visa', 'Visa', 'MasterCard', 'MasterCard', 'MasterCard', 'MasterCard', 'MasterCard', 'American Express', 'Discover Card'],

	card_params: {
		'Visa': [
			"4539############",
			"4556############",
			"4916############",
			"4532############",
			"4929############",
			"40240071########",
			"4485############",
			"4716############",
			"4###############"
		],

		'MasterCard': [
			"51##############",
			"52##############",
			"53##############",
			"54##############",
			"55##############"
		],

		'American Express': [
			"34#############",
			"37#############"
		],

		'Discover Card': [
			"6011############"
		]
	},

	card_type: function() {
		return this.random_element(this.card_vendors);
	},

	card_number: function(vendor) {
		vendor = vendor || this.card_type;
		var mask = this.random_element(this.card_params[vendor]);
		return this.numerify(mask);
	},

	card_exp: function() {
		return this.date('MM/YY');
	},

	card_data: function() {
		var type = this.card_type;
		return {
			type: type,
			number: this.card_number(type),
			exp: this.card_exp,
			holder_name: this.full_name
		};
	}
};

module.exports = provider;

},{}],14:[function(require,module,exports){
var glues = ['.', '-', '_', null];

var provider = {
	phone_formats: ['###-###-####'],

	prefix: ['Mr.', 'Mrs.', 'Ms.', 'Miss', 'Dr.'],

	suffix: ['Jr.', 'Sr.', 'I', 'II', 'III', 'IV', 'V', 'MD', 'DDS', 'PhD', 'DVM'],

	company_suffixes: ['Inc', 'and Sons', 'LLC', 'Group', 'PLC', 'Ltd'],

	catch_phrase_words: [
		['Adaptive', 'Advanced', 'Ameliorated', 'Assimilated', 'Automated', 'Balanced', 'Business-focused', 'Centralized', 'Cloned', 'Compatible', 'Configurable', 'Cross-group', 'Cross-platform', 'Customer-focused', 'Customizable', 'Decentralized', 'De-engineered', 'Devolved', 'Digitized', 'Distributed', 'Diverse', 'Down-sized', 'Enhanced', 'Enterprise-wide', 'Ergonomic', 'Exclusive', 'Expanded', 'Extended', 'Facetoface', 'Focused', 'Front-line', 'Fully-configurable', 'Function-based', 'Fundamental', 'Future-proofed', 'Grass-roots', 'Horizontal', 'Implemented', 'Innovative', 'Integrated', 'Intuitive', 'Inverse', 'Managed', 'Mandatory', 'Monitored', 'Multi-channelled', 'Multi-lateral', 'Multi-layered', 'Multi-tiered', 'Networked', 'Object-based', 'Open-architected', 'Open-source', 'Operative', 'Optimized', 'Optional', 'Organic', 'Organized', 'Persevering', 'Persistent', 'Phased', 'Polarised', 'Pre-emptive', 'Proactive', 'Profit-focused', 'Profound', 'Programmable', 'Progressive', 'Public-key', 'Quality-focused', 'Reactive', 'Realigned', 'Re-contextualized', 'Re-engineered', 'Reduced', 'Reverse-engineered', 'Right-sized', 'Robust', 'Seamless', 'Secured', 'Self-enabling', 'Sharable', 'Stand-alone', 'Streamlined', 'Switchable', 'Synchronised', 'Synergistic', 'Synergized', 'Team-oriented', 'Total', 'Triple-buffered', 'Universal', 'Up-sized', 'Upgradable', 'User-centric', 'User-friendly', 'Versatile', 'Virtual', 'Visionary', 'Vision-oriented'],
		['24hour', '24/7', '3rdgeneration', '4thgeneration', '5thgeneration', '6thgeneration', 'actuating', 'analyzing', 'assymetric', 'asynchronous', 'attitude-oriented', 'background', 'bandwidth-monitored', 'bi-directional', 'bifurcated', 'bottom-line', 'clear-thinking', 'client-driven', 'client-server', 'coherent', 'cohesive', 'composite', 'context-sensitive', 'contextually-based', 'content-based', 'dedicated', 'demand-driven', 'didactic', 'directional', 'discrete', 'disintermediate', 'dynamic', 'eco-centric', 'empowering', 'encompassing', 'even-keeled', 'executive', 'explicit', 'exuding', 'fault-tolerant', 'foreground', 'fresh-thinking', 'full-range', 'global', 'grid-enabled', 'heuristic', 'high-level', 'holistic', 'homogeneous', 'human-resource', 'hybrid', 'impactful', 'incremental', 'intangible', 'interactive', 'intermediate', 'leadingedge', 'local', 'logistical', 'maximized', 'methodical', 'mission-critical', 'mobile', 'modular', 'motivating', 'multimedia', 'multi-state', 'multi-tasking', 'national', 'needs-based', 'neutral', 'nextgeneration', 'non-volatile', 'object-oriented', 'optimal', 'optimizing', 'radical', 'real-time', 'reciprocal', 'regional', 'responsive', 'scalable', 'secondary', 'solution-oriented', 'stable', 'static', 'systematic', 'systemic', 'system-worthy', 'tangible', 'tertiary', 'transitional', 'uniform', 'upward-trending', 'user-facing', 'value-added', 'web-enabled', 'well-modulated', 'zeroadministration', 'zerodefect', 'zerotolerance'],
		['ability', 'access', 'adapter', 'algorithm', 'alliance', 'analyzer', 'application', 'approach', 'architecture', 'archive', 'artificialintelligence', 'array', 'attitude', 'benchmark', 'budgetarymanagement', 'capability', 'capacity', 'challenge', 'circuit', 'collaboration', 'complexity', 'concept', 'conglomeration', 'contingency', 'core', 'customerloyalty', 'database', 'data-warehouse', 'definition', 'emulation', 'encoding', 'encryption', 'extranet', 'firmware', 'flexibility', 'focusgroup', 'forecast', 'frame', 'framework', 'function', 'functionalities', 'GraphicInterface', 'groupware', 'GraphicalUserInterface', 'hardware', 'help-desk', 'hierarchy', 'hub', 'implementation', 'info-mediaries', 'infrastructure', 'initiative', 'installation', 'instructionset', 'interface', 'internetsolution', 'intranet', 'knowledgeuser', 'knowledgebase', 'localareanetwork', 'leverage', 'matrices', 'matrix', 'methodology', 'middleware', 'migration', 'model', 'moderator', 'monitoring', 'moratorium', 'neural-net', 'openarchitecture', 'opensystem', 'orchestration', 'paradigm', 'parallelism', 'policy', 'portal', 'pricingstructure', 'processimprovement', 'product', 'productivity', 'project', 'projection', 'protocol', 'securedline', 'service-desk', 'software', 'solution', 'standardization', 'strategy', 'structure', 'success', 'superstructure', 'support', 'synergy', 'systemengine', 'task-force', 'throughput', 'time-frame', 'toolset', 'utilisation', 'website', 'workforce']
	],

	first_names: ['Aaliyah', 'Aaron', 'Abagail', 'Abbey', 'Abbie', 'Abbigail', 'Abby', 'Abdiel', 'Abdul', 'Abdullah', 'Abe', 'Abel', 'Abelardo', 'Abigail', 'Abigale', 'Abigayle', 'Abner', 'Abraham', 'Ada', 'Adah', 'Adalberto', 'Adaline', 'Adam', 'Adan', 'Addie', 'Addison', 'Adela', 'Adelbert', 'Adele', 'Adelia', 'Adeline', 'Adell', 'Adella', 'Adelle', 'Aditya', 'Adolf', 'Adolfo', 'Adolph', 'Adolphus', 'Adonis', 'Adrain', 'Adrian', 'Adriana', 'Adrianna', 'Adriel', 'Adrien', 'Adrienne', 'Afton', 'Aglae', 'Agnes', 'Agustin', 'Agustina', 'Ahmad', 'Ahmed', 'Aida', 'Aidan', 'Aiden', 'Aileen', 'Aimee', 'Aisha', 'Aiyana', 'Akeem', 'Al', 'Alaina', 'Alan', 'Alana', 'Alanis', 'Alanna', 'Alayna', 'Alba', 'Albert', 'Alberta', 'Albertha', 'Alberto', 'Albin', 'Albina', 'Alda', 'Alden', 'Alec', 'Aleen', 'Alejandra', 'Alejandrin', 'Alek', 'Alena', 'Alene', 'Alessandra', 'Alessandro', 'Alessia', 'Aletha', 'Alex', 'Alexa', 'Alexander', 'Alexandra', 'Alexandre', 'Alexandrea', 'Alexandria', 'Alexandrine', 'Alexandro', 'Alexane', 'Alexanne', 'Alexie', 'Alexis', 'Alexys', 'Alexzander', 'Alf', 'Alfonso', 'Alfonzo', 'Alford', 'Alfred', 'Alfreda', 'Alfredo', 'Ali', 'Alia', 'Alice', 'Alicia', 'Alisa', 'Alisha', 'Alison', 'Alivia', 'Aliya', 'Aliyah', 'Aliza', 'Alize', 'Allan', 'Allen', 'Allene', 'Allie', 'Allison', 'Ally', 'Alphonso', 'Alta', 'Althea', 'Alva', 'Alvah', 'Alvena', 'Alvera', 'Alverta', 'Alvina', 'Alvis', 'Alyce', 'Alycia', 'Alysa', 'Alysha', 'Alyson', 'Alysson', 'Amalia', 'Amanda', 'Amani', 'Amara', 'Amari', 'Amaya', 'Amber', 'Ambrose', 'Amelia', 'Amelie', 'Amely', 'America', 'Americo', 'Amie', 'Amina', 'Amir', 'Amira', 'Amiya', 'Amos', 'Amparo', 'Amy', 'Amya', 'Ana', 'Anabel', 'Anabelle', 'Anahi', 'Anais', 'Anastacio', 'Anastasia', 'Anderson', 'Andre', 'Andreane', 'Andreanne', 'Andres', 'Andrew', 'Andy', 'Angel', 'Angela', 'Angelica', 'Angelina', 'Angeline', 'Angelita', 'Angelo', 'Angie', 'Angus', 'Anibal', 'Anika', 'Anissa', 'Anita', 'Aniya', 'Aniyah', 'Anjali', 'Anna', 'Annabel', 'Annabell', 'Annabelle', 'Annalise', 'Annamae', 'Annamarie', 'Anne', 'Annetta', 'Annette', 'Annie', 'Ansel', 'Ansley', 'Anthony', 'Antoinette', 'Antone', 'Antonetta', 'Antonette', 'Antonia', 'Antonietta', 'Antonina', 'Antonio', 'Antwan', 'Antwon', 'Anya', 'April', 'Ara', 'Araceli', 'Aracely', 'Arch', 'Archibald', 'Ardella', 'Arden', 'Ardith', 'Arely', 'Ari', 'Ariane', 'Arianna', 'Aric', 'Ariel', 'Arielle', 'Arjun', 'Arlene', 'Arlie', 'Arlo', 'Armand', 'Armando', 'Armani', 'Arnaldo', 'Arne', 'Arno', 'Arnold', 'Arnoldo', 'Arnulfo', 'Aron', 'Art', 'Arthur', 'Arturo', 'Arvel', 'Arvid', 'Arvilla', 'Aryanna', 'Asa', 'Asha', 'Ashlee', 'Ashleigh', 'Ashley', 'Ashly', 'Ashlynn', 'Ashton', 'Ashtyn', 'Asia', 'Assunta', 'Astrid', 'Athena', 'Aubree', 'Aubrey', 'Audie', 'Audra', 'Audreanne', 'Audrey', 'August', 'Augusta', 'Augustine', 'Augustus', 'Aurelia', 'Aurelie', 'Aurelio', 'Aurore', 'Austen', 'Austin', 'Austyn', 'Autumn', 'Ava', 'Avery', 'Avis', 'Axel', 'Ayana', 'Ayden', 'Ayla', 'Aylin', 'Baby', 'Bailee', 'Bailey', 'Barbara', 'Barney', 'Baron', 'Barrett', 'Barry', 'Bart', 'Bartholome', 'Barton', 'Baylee', 'Beatrice', 'Beau', 'Beaulah', 'Bell', 'Bella', 'Belle', 'Ben', 'Benedict', 'Benjamin', 'Bennett', 'Bennie', 'Benny', 'Benton', 'Berenice', 'Bernadette', 'Bernadine', 'Bernard', 'Bernardo', 'Berneice', 'Bernhard', 'Bernice', 'Bernie', 'Berniece', 'Bernita', 'Berry', 'Bert', 'Berta', 'Bertha', 'Bertram', 'Bertrand', 'Beryl', 'Bessie', 'Beth', 'Bethany', 'Bethel', 'Betsy', 'Bette', 'Bettie', 'Betty', 'Bettye', 'Beulah', 'Beverly', 'Bianka', 'Bill', 'Billie', 'Billy', 'Birdie', 'Blair', 'Blaise', 'Blake', 'Blanca', 'Blanche', 'Blaze', 'Bo', 'Bobbie', 'Bobby', 'Bonita', 'Bonnie', 'Boris', 'Boyd', 'Brad', 'Braden', 'Bradford', 'Bradley', 'Bradly', 'Brady', 'Braeden', 'Brain', 'Brandi', 'Brando', 'Brandon', 'Brandt', 'Brandy', 'Brandyn', 'Brannon', 'Branson', 'Brant', 'Braulio', 'Braxton', 'Brayan', 'Breana', 'Breanna', 'Breanne', 'Brenda', 'Brendan', 'Brenden', 'Brendon', 'Brenna', 'Brennan', 'Brennon', 'Brent', 'Bret', 'Brett', 'Bria', 'Brian', 'Briana', 'Brianne', 'Brice', 'Bridget', 'Bridgette', 'Bridie', 'Brielle', 'Brigitte', 'Brionna', 'Brisa', 'Britney', 'Brittany', 'Brock', 'Broderick', 'Brody', 'Brook', 'Brooke', 'Brooklyn', 'Brooks', 'Brown', 'Bruce', 'Bryana', 'Bryce', 'Brycen', 'Bryon', 'Buck', 'Bud', 'Buddy', 'Buford', 'Bulah', 'Burdette', 'Burley', 'Burnice', 'Buster', 'Cade', 'Caden', 'Caesar', 'Caitlyn', 'Cale', 'Caleb', 'Caleigh', 'Cali', 'Calista', 'Callie', 'Camden', 'Cameron', 'Camila', 'Camilla', 'Camille', 'Camren', 'Camron', 'Camryn', 'Camylle', 'Candace', 'Candelario', 'Candice', 'Candida', 'Candido', 'Cara', 'Carey', 'Carissa', 'Carlee', 'Carleton', 'Carley', 'Carli', 'Carlie', 'Carlo', 'Carlos', 'Carlotta', 'Carmel', 'Carmela', 'Carmella', 'Carmelo', 'Carmen', 'Carmine', 'Carol', 'Carolanne', 'Carole', 'Carolina', 'Caroline', 'Carolyn', 'Carolyne', 'Carrie', 'Carroll', 'Carson', 'Carter', 'Cary', 'Casandra', 'Casey', 'Casimer', 'Casimir', 'Casper', 'Cassandra', 'Cassandre', 'Cassidy', 'Cassie', 'Catalina', 'Caterina', 'Catharine', 'Catherine', 'Cathrine', 'Cathryn', 'Cathy', 'Cayla', 'Ceasar', 'Cecelia', 'Cecil', 'Cecile', 'Cecilia', 'Cedrick', 'Celestine', 'Celestino', 'Celia', 'Celine', 'Cesar', 'Chad', 'Chadd', 'Chadrick', 'Chaim', 'Chance', 'Chandler', 'Chanel', 'Chanelle', 'Charity', 'Charlene', 'Charles', 'Charley', 'Charlie', 'Charlotte', 'Chase', 'Chasity', 'Chauncey', 'Chaya', 'Chaz', 'Chelsea', 'Chelsey', 'Chelsie', 'Chesley', 'Chester', 'Chet', 'Cheyanne', 'Cheyenne', 'Chloe', 'Chris', 'Christ', 'Christa', 'Christelle', 'Christian', 'Christiana', 'Christina', 'Christine', 'Christop', 'Christophe', 'Christopher', 'Christy', 'Chyna', 'Ciara', 'Cicero', 'Cielo', 'Cierra', 'Cindy', 'Citlalli', 'Clair', 'Claire', 'Clara', 'Clarabelle', 'Clare', 'Clarissa', 'Clark', 'Claud', 'Claude', 'Claudia', 'Claudie', 'Claudine', 'Clay', 'Clemens', 'Clement', 'Clementina', 'Clementine', 'Clemmie', 'Cleo', 'Cleora', 'Cleta', 'Cletus', 'Cleve', 'Cleveland', 'Clifford', 'Clifton', 'Clint', 'Clinton', 'Clotilde', 'Clovis', 'Cloyd', 'Clyde', 'Coby', 'Cody', 'Colby', 'Cole', 'Coleman', 'Colin', 'Colleen', 'Collin', 'Colt', 'Colten', 'Colton', 'Columbus', 'Concepcion', 'Conner', 'Connie', 'Connor', 'Conor', 'Conrad', 'Constance', 'Constantin', 'Consuelo', 'Cooper', 'Cora', 'Coralie', 'Corbin', 'Cordelia', 'Cordell', 'Cordia', 'Cordie', 'Corene', 'Corine', 'Cornelius', 'Cornell', 'Corrine', 'Cortez', 'Cortney', 'Cory', 'Coty', 'Courtney', 'Coy', 'Craig', 'Crawford', 'Creola', 'Cristal', 'Cristian', 'Cristina', 'Cristobal', 'Cristopher', 'Cruz', 'Crystal', 'Crystel', 'Cullen', 'Curt', 'Curtis', 'Cydney', 'Cynthia', 'Cyril', 'Cyrus', 'Dagmar', 'Dahlia', 'Daija', 'Daisha', 'Daisy', 'Dakota', 'Dale', 'Dallas', 'Dallin', 'Dalton', 'Damaris', 'Dameon', 'Damian', 'Damien', 'Damion', 'Damon', 'Dan', 'Dana', 'Dandre', 'Dane', 'Dangelo', 'Danial', 'Daniela', 'Daniella', 'Danielle', 'Danika', 'Dannie', 'Danny', 'Dante', 'Danyka', 'Daphne', 'Daphnee', 'Daphney', 'Darby', 'Daren', 'Darian', 'Dariana', 'Darien', 'Dario', 'Darion', 'Darius', 'Darlene', 'Daron', 'Darrel', 'Darrell', 'Darren', 'Darrick', 'Darrin', 'Darrion', 'Darron', 'Darryl', 'Darwin', 'Daryl', 'Dashawn', 'Dasia', 'Dave', 'David', 'Davin', 'Davion', 'Davon', 'Davonte', 'Dawn', 'Dawson', 'Dax', 'Dayana', 'Dayna', 'Dayne', 'Dayton', 'Dean', 'Deangelo', 'Deanna', 'Deborah', 'Declan', 'Dedric', 'Dedrick', 'Dee', 'Deion', 'Deja', 'Dejah', 'Dejon', 'Dejuan', 'Delaney', 'Delbert', 'Delfina', 'Delia', 'Delilah', 'Dell', 'Della', 'Delmer', 'Delores', 'Delpha', 'Delphia', 'Delphine', 'Delta', 'Demarco', 'Demarcus', 'Demario', 'Demetris', 'Demetrius', 'Demond', 'Dena', 'Denis', 'Dennis', 'Deon', 'Deondre', 'Deontae', 'Deonte', 'Dereck', 'Derek', 'Derick', 'Deron', 'Derrick', 'Deshaun', 'Deshawn', 'Desiree', 'Desmond', 'Dessie', 'Destany', 'Destin', 'Destinee', 'Destiney', 'Destini', 'Destiny', 'Devan', 'Devante', 'Deven', 'Devin', 'Devon', 'Devonte', 'Devyn', 'Dewayne', 'Dewitt', 'Dexter', 'Diamond', 'Diana', 'Dianna', 'Diego', 'Dillan', 'Dillon', 'Dimitri', 'Dina', 'Dino', 'Dion', 'Dixie', 'Dock', 'Dolly', 'Dolores', 'Domenic', 'Domenica', 'Domenick', 'Domenico', 'Domingo', 'Dominic', 'Dominique', 'Don', 'Donald', 'Donato', 'Donavon', 'Donna', 'Donnell', 'Donnie', 'Donny', 'Dora', 'Dorcas', 'Dorian', 'Doris', 'Dorothea', 'Dorothy', 'Dorris', 'Dortha', 'Dorthy', 'Doug', 'Douglas', 'Dovie', 'Doyle', 'Drake', 'Drew', 'Duane', 'Dudley', 'Dulce', 'Duncan', 'Durward', 'Dustin', 'Dusty', 'Dwight', 'Dylan', 'Earl', 'Earlene', 'Earline', 'Earnest', 'Earnestine', 'Easter', 'Easton', 'Ebba', 'Ebony', 'Ed', 'Eda', 'Edd', 'Eddie', 'Eden', 'Edgar', 'Edgardo', 'Edison', 'Edmond', 'Edmund', 'Edna', 'Eduardo', 'Edward', 'Edwardo', 'Edwin', 'Edwina', 'Edyth', 'Edythe', 'Effie', 'Efrain', 'Efren', 'Eileen', 'Einar', 'Eino', 'Eladio', 'Elaina', 'Elbert', 'Elda', 'Eldon', 'Eldora', 'Eldred', 'Eldridge', 'Eleanora', 'Eleanore', 'Eleazar', 'Electa', 'Elena', 'Elenor', 'Elenora', 'Eleonore', 'Elfrieda', 'Eli', 'Elian', 'Eliane', 'Elias', 'Eliezer', 'Elijah', 'Elinor', 'Elinore', 'Elisa', 'Elisabeth', 'Elise', 'Eliseo', 'Elisha', 'Elissa', 'Eliza', 'Elizabeth', 'Ella', 'Ellen', 'Ellie', 'Elliot', 'Elliott', 'Ellis', 'Ellsworth', 'Elmer', 'Elmira', 'Elmo', 'Elmore', 'Elna', 'Elnora', 'Elody', 'Eloisa', 'Eloise', 'Elouise', 'Eloy', 'Elroy', 'Elsa', 'Else', 'Elsie', 'Elta', 'Elton', 'Elva', 'Elvera', 'Elvie', 'Elvis', 'Elwin', 'Elwyn', 'Elyse', 'Elyssa', 'Elza', 'Emanuel', 'Emelia', 'Emelie', 'Emely', 'Emerald', 'Emerson', 'Emery', 'Emie', 'Emil', 'Emile', 'Emilia', 'Emiliano', 'Emilie', 'Emilio', 'Emily', 'Emma', 'Emmalee', 'Emmanuel', 'Emmanuelle', 'Emmet', 'Emmett', 'Emmie', 'Emmitt', 'Emmy', 'Emory', 'Ena', 'Enid', 'Enoch', 'Enola', 'Enos', 'Enrico', 'Enrique', 'Ephraim', 'Era', 'Eriberto', 'Eric', 'Erica', 'Erich', 'Erick', 'Ericka', 'Erik', 'Erika', 'Erin', 'Erling', 'Erna', 'Ernest', 'Ernestina', 'Ernestine', 'Ernesto', 'Ernie', 'Ervin', 'Erwin', 'Eryn', 'Esmeralda', 'Esperanza', 'Esta', 'Esteban', 'Estefania', 'Estel', 'Estell', 'Estella', 'Estelle', 'Estevan', 'Esther', 'Estrella', 'Etha', 'Ethan', 'Ethel', 'Ethelyn', 'Ethyl', 'Ettie', 'Eudora', 'Eugene', 'Eugenia', 'Eula', 'Eulah', 'Eulalia', 'Euna', 'Eunice', 'Eusebio', 'Eva', 'Evalyn', 'Evan', 'Evangeline', 'Evans', 'Eve', 'Eveline', 'Evelyn', 'Everardo', 'Everett', 'Everette', 'Evert', 'Evie', 'Ewald', 'Ewell', 'Ezekiel', 'Ezequiel', 'Ezra', 'Fabian', 'Fabiola', 'Fae', 'Fannie', 'Fanny', 'Fatima', 'Faustino', 'Fausto', 'Favian', 'Fay', 'Faye', 'Federico', 'Felicia', 'Felicita', 'Felicity', 'Felipa', 'Felipe', 'Felix', 'Felton', 'Fermin', 'Fern', 'Fernando', 'Ferne', 'Fidel', 'Filiberto', 'Filomena', 'Finn', 'Fiona', 'Flavie', 'Flavio', 'Fleta', 'Fletcher', 'Flo', 'Florence', 'Florencio', 'Florian', 'Florida', 'Florine', 'Flossie', 'Floy', 'Floyd', 'Ford', 'Forest', 'Forrest', 'Foster', 'Frances', 'Francesca', 'Francesco', 'Francis', 'Francisca', 'Francisco', 'Franco', 'Frank', 'Frankie', 'Franz', 'Fred', 'Freda', 'Freddie', 'Freddy', 'Frederic', 'Frederick', 'Frederik', 'Frederique', 'Fredrick', 'Fredy', 'Freeda', 'Freeman', 'Freida', 'Frida', 'Frieda', 'Friedrich', 'Fritz', 'Furman', 'Gabe', 'Gabriel', 'Gabriella', 'Gabrielle', 'Gaetano', 'Gage', 'Gail', 'Gardner', 'Garett', 'Garfield', 'Garland', 'Garnet', 'Garnett', 'Garret', 'Garrett', 'Garrick', 'Garrison', 'Garry', 'Garth', 'Gaston', 'Gavin', 'Gay', 'Gayle', 'Gaylord', 'Gene', 'General', 'Genesis', 'Genevieve', 'Gennaro', 'Genoveva', 'Geo', 'Geoffrey', 'George', 'Georgette', 'Georgiana', 'Georgianna', 'Geovanni', 'Geovanny', 'Geovany', 'Gerald', 'Geraldine', 'Gerard', 'Gerardo', 'Gerda', 'Gerhard', 'Germaine', 'German', 'Gerry', 'Gerson', 'Gertrude', 'Gia', 'Gianni', 'Gideon', 'Gilbert', 'Gilberto', 'Gilda', 'Giles', 'Gillian', 'Gina', 'Gino', 'Giovani', 'Giovanna', 'Giovanni', 'Giovanny', 'Gisselle', 'Giuseppe', 'Gladyce', 'Gladys', 'Glen', 'Glenda', 'Glenna', 'Glennie', 'Gloria', 'Godfrey', 'Golda', 'Golden', 'Gonzalo', 'Gordon', 'Grace', 'Gracie', 'Graciela', 'Grady', 'Graham', 'Grant', 'Granville', 'Grayce', 'Grayson', 'Green', 'Greg', 'Gregg', 'Gregoria', 'Gregorio', 'Gregory', 'Greta', 'Gretchen', 'Greyson', 'Griffin', 'Grover', 'Guadalupe', 'Gudrun', 'Guido', 'Guillermo', 'Guiseppe', 'Gunnar', 'Gunner', 'Gus', 'Gussie', 'Gust', 'Gustave', 'Guy', 'Gwen', 'Gwendolyn', 'Hadley', 'Hailee', 'Hailey', 'Hailie', 'Hal', 'Haleigh', 'Haley', 'Halie', 'Halle', 'Hallie', 'Hank', 'Hanna', 'Hannah', 'Hans', 'Hardy', 'Harley', 'Harmon', 'Harmony', 'Harold', 'Harrison', 'Harry', 'Harvey', 'Haskell', 'Hassan', 'Hassie', 'Hattie', 'Haven', 'Hayden', 'Haylee', 'Hayley', 'Haylie', 'Hazel', 'Hazle', 'Heath', 'Heather', 'Heaven', 'Heber', 'Hector', 'Heidi', 'Helen', 'Helena', 'Helene', 'Helga', 'Hellen', 'Helmer', 'Heloise', 'Henderson', 'Henri', 'Henriette', 'Henry', 'Herbert', 'Herman', 'Hermann', 'Hermina', 'Herminia', 'Herminio', 'Hershel', 'Herta', 'Hertha', 'Hester', 'Hettie', 'Hilario', 'Hilbert', 'Hilda', 'Hildegard', 'Hillard', 'Hillary', 'Hilma', 'Hilton', 'Hipolito', 'Hiram', 'Hobart', 'Holden', 'Hollie', 'Hollis', 'Holly', 'Hope', 'Horace', 'Horacio', 'Hortense', 'Hosea', 'Houston', 'Howard', 'Howell', 'Hoyt', 'Hubert', 'Hudson', 'Hugh', 'Hulda', 'Humberto', 'Hunter', 'Hyman', 'Ian', 'Ibrahim', 'Icie', 'Ida', 'Idell', 'Idella', 'Ignacio', 'Ignatius', 'Ike', 'Ila', 'Ilene', 'Iliana', 'Ima', 'Imani', 'Imelda', 'Immanuel', 'Imogene', 'Ines', 'Irma', 'Irving', 'Irwin', 'Isaac', 'Isabel', 'Isabell', 'Isabella', 'Isabelle', 'Isac', 'Isadore', 'Isai', 'Isaiah', 'Isaias', 'Isidro', 'Ismael', 'Isobel', 'Isom', 'Israel', 'Issac', 'Itzel', 'Iva', 'Ivah', 'Ivory', 'Ivy', 'Izabella', 'Izaiah', 'Jabari', 'Jace', 'Jacey', 'Jacinthe', 'Jacinto', 'Jack', 'Jackeline', 'Jackie', 'Jacklyn', 'Jackson', 'Jacky', 'Jaclyn', 'Jacquelyn', 'Jacques', 'Jacynthe', 'Jada', 'Jade', 'Jaden', 'Jadon', 'Jadyn', 'Jaeden', 'Jaida', 'Jaiden', 'Jailyn', 'Jaime', 'Jairo', 'Jakayla', 'Jake', 'Jakob', 'Jaleel', 'Jalen', 'Jalon', 'Jalyn', 'Jamaal', 'Jamal', 'Jamar', 'Jamarcus', 'Jamel', 'Jameson', 'Jamey', 'Jamie', 'Jamil', 'Jamir', 'Jamison', 'Jammie', 'Jan', 'Jana', 'Janae', 'Jane', 'Janelle', 'Janessa', 'Janet', 'Janice', 'Janick', 'Janie', 'Janis', 'Janiya', 'Jannie', 'Jany', 'Jaquan', 'Jaquelin', 'Jaqueline', 'Jared', 'Jaren', 'Jarod', 'Jaron', 'Jarred', 'Jarrell', 'Jarret', 'Jarrett', 'Jarrod', 'Jarvis', 'Jasen', 'Jasmin', 'Jason', 'Jasper', 'Jaunita', 'Javier', 'Javon', 'Javonte', 'Jay', 'Jayce', 'Jaycee', 'Jayda', 'Jayde', 'Jayden', 'Jaydon', 'Jaylan', 'Jaylen', 'Jaylin', 'Jaylon', 'Jayme', 'Jayne', 'Jayson', 'Jazlyn', 'Jazmin', 'Jazmyn', 'Jazmyne', 'Jean', 'Jeanette', 'Jeanie', 'Jeanne', 'Jed', 'Jedediah', 'Jedidiah', 'Jeff', 'Jefferey', 'Jeffery', 'Jeffrey', 'Jeffry', 'Jena', 'Jenifer', 'Jennie', 'Jennifer', 'Jennings', 'Jennyfer', 'Jensen', 'Jerad', 'Jerald', 'Jeramie', 'Jeramy', 'Jerel', 'Jeremie', 'Jeremy', 'Jermain', 'Jermaine', 'Jermey', 'Jerod', 'Jerome', 'Jeromy', 'Jerrell', 'Jerrod', 'Jerrold', 'Jerry', 'Jess', 'Jesse', 'Jessica', 'Jessie', 'Jessika', 'Jessy', 'Jessyca', 'Jesus', 'Jett', 'Jettie', 'Jevon', 'Jewel', 'Jewell', 'Jillian', 'Jimmie', 'Jimmy', 'Jo', 'Joan', 'Joana', 'Joanie', 'Joanne', 'Joannie', 'Joanny', 'Joany', 'Joaquin', 'Jocelyn', 'Jodie', 'Jody', 'Joe', 'Joel', 'Joelle', 'Joesph', 'Joey', 'Johan', 'Johann', 'Johanna', 'Johathan', 'John', 'Johnathan', 'Johnathon', 'Johnnie', 'Johnny', 'Johnpaul', 'Johnson', 'Jolie', 'Jon', 'Jonas', 'Jonatan', 'Jonathan', 'Jonathon', 'Jordan', 'Jordane', 'Jordi', 'Jordon', 'Jordy', 'Jordyn', 'Jorge', 'Jose', 'Josefa', 'Josefina', 'Joseph', 'Josephine', 'Josh', 'Joshua', 'Joshuah', 'Josiah', 'Josiane', 'Josianne', 'Josie', 'Josue', 'Jovan', 'Jovani', 'Jovanny', 'Jovany', 'Joy', 'Joyce', 'Juana', 'Juanita', 'Judah', 'Judd', 'Jude', 'Judge', 'Judson', 'Judy', 'Jules', 'Julia', 'Julian', 'Juliana', 'Julianne', 'Julie', 'Julien', 'Juliet', 'Julio', 'Julius', 'June', 'Junior', 'Junius', 'Justen', 'Justice', 'Justina', 'Justine', 'Juston', 'Justus', 'Justyn', 'Juvenal', 'Juwan', 'Kacey', 'Kaci', 'Kacie', 'Kade', 'Kaden', 'Kadin', 'Kaela', 'Kaelyn', 'Kaia', 'Kailee', 'Kailey', 'Kailyn', 'Kaitlin', 'Kaitlyn', 'Kale', 'Kaleb', 'Kaleigh', 'Kaley', 'Kali', 'Kallie', 'Kameron', 'Kamille', 'Kamren', 'Kamron', 'Kamryn', 'Kane', 'Kara', 'Kareem', 'Karelle', 'Karen', 'Kari', 'Kariane', 'Karianne', 'Karina', 'Karine', 'Karl', 'Karlee', 'Karley', 'Karli', 'Karlie', 'Karolann', 'Karson', 'Kasandra', 'Kasey', 'Kassandra', 'Katarina', 'Katelin', 'Katelyn', 'Katelynn', 'Katharina', 'Katherine', 'Katheryn', 'Kathleen', 'Kathlyn', 'Kathryn', 'Kathryne', 'Katlyn', 'Katlynn', 'Katrina', 'Katrine', 'Kattie', 'Kavon', 'Kay', 'Kaya', 'Kaycee', 'Kayden', 'Kayla', 'Kaylah', 'Kaylee', 'Kayleigh', 'Kayley', 'Kayli', 'Kaylie', 'Kaylin', 'Keagan', 'Keanu', 'Keara', 'Keaton', 'Keegan', 'Keeley', 'Keely', 'Keenan', 'Keira', 'Keith', 'Kellen', 'Kelley', 'Kelli', 'Kellie', 'Kelly', 'Kelsi', 'Kelsie', 'Kelton', 'Kelvin', 'Ken', 'Kendall', 'Kendra', 'Kendrick', 'Kenna', 'Kennedi', 'Kennedy', 'Kenneth', 'Kennith', 'Kenny', 'Kenton', 'Kenya', 'Kenyatta', 'Kenyon', 'Keon', 'Keshaun', 'Keshawn', 'Keven', 'Kevin', 'Kevon', 'Keyon', 'Keyshawn', 'Khalid', 'Khalil', 'Kian', 'Kiana', 'Kianna', 'Kiara', 'Kiarra', 'Kiel', 'Kiera', 'Kieran', 'Kiley', 'Kim', 'Kimberly', 'King', 'Kip', 'Kira', 'Kirk', 'Kirsten', 'Kirstin', 'Kitty', 'Kobe', 'Koby', 'Kody', 'Kolby', 'Kole', 'Korbin', 'Korey', 'Kory', 'Kraig', 'Kris', 'Krista', 'Kristian', 'Kristin', 'Kristina', 'Kristofer', 'Kristoffer', 'Kristopher', 'Kristy', 'Krystal', 'Krystel', 'Krystina', 'Kurt', 'Kurtis', 'Kyla', 'Kyle', 'Kylee', 'Kyleigh', 'Kyler', 'Kylie', 'Kyra', 'Lacey', 'Lacy', 'Ladarius', 'Lafayette', 'Laila', 'Laisha', 'Lamar', 'Lambert', 'Lamont', 'Lance', 'Landen', 'Lane', 'Laney', 'Larissa', 'Laron', 'Larry', 'Larue', 'Laura', 'Laurel', 'Lauren', 'Laurence', 'Lauretta', 'Lauriane', 'Laurianne', 'Laurie', 'Laurine', 'Laury', 'Lauryn', 'Lavada', 'Lavern', 'Laverna', 'Laverne', 'Lavina', 'Lavinia', 'Lavon', 'Lavonne', 'Lawrence', 'Lawson', 'Layla', 'Layne', 'Lazaro', 'Lea', 'Leann', 'Leanna', 'Leanne', 'Leatha', 'Leda', 'Lee', 'Leif', 'Leila', 'Leilani', 'Lela', 'Lelah', 'Leland', 'Lelia', 'Lempi', 'Lemuel', 'Lenna', 'Lennie', 'Lenny', 'Lenora', 'Lenore', 'Leo', 'Leola', 'Leon', 'Leonard', 'Leonardo', 'Leone', 'Leonel', 'Leonie', 'Leonor', 'Leonora', 'Leopold', 'Leopoldo', 'Leora', 'Lera', 'Lesley', 'Leslie', 'Lesly', 'Lessie', 'Lester', 'Leta', 'Letha', 'Letitia', 'Levi', 'Lew', 'Lewis', 'Lexi', 'Lexie', 'Lexus', 'Lia', 'Liam', 'Liana', 'Libbie', 'Libby', 'Lila', 'Lilian', 'Liliana', 'Liliane', 'Lilla', 'Lillian', 'Lilliana', 'Lillie', 'Lilly', 'Lily', 'Lilyan', 'Lina', 'Lincoln', 'Linda', 'Lindsay', 'Lindsey', 'Linnea', 'Linnie', 'Linwood', 'Lionel', 'Lisa', 'Lisandro', 'Lisette', 'Litzy', 'Liza', 'Lizeth', 'Lizzie', 'Llewellyn', 'Lloyd', 'Logan', 'Lois', 'Lola', 'Lolita', 'Loma', 'Lon', 'London', 'Lonie', 'Lonnie', 'Lonny', 'Lonzo', 'Lora', 'Loraine', 'Loren', 'Lorena', 'Lorenz', 'Lorenza', 'Lorenzo', 'Lori', 'Lorine', 'Lorna', 'Lottie', 'Lou', 'Louie', 'Louisa', 'Lourdes', 'Louvenia', 'Lowell', 'Loy', 'Loyal', 'Loyce', 'Lucas', 'Luciano', 'Lucie', 'Lucienne', 'Lucile', 'Lucinda', 'Lucio', 'Lucious', 'Lucius', 'Lucy', 'Ludie', 'Ludwig', 'Lue', 'Luella', 'Luigi', 'Luis', 'Luisa', 'Lukas', 'Lula', 'Lulu', 'Luna', 'Lupe', 'Lura', 'Lurline', 'Luther', 'Luz', 'Lyda', 'Lydia', 'Lyla', 'Lynn', 'Lyric', 'Lysanne', 'Mabel', 'Mabelle', 'Mable', 'Mac', 'Macey', 'Maci', 'Macie', 'Mack', 'Mackenzie', 'Macy', 'Madaline', 'Madalyn', 'Maddison', 'Madeline', 'Madelyn', 'Madelynn', 'Madge', 'Madie', 'Madilyn', 'Madisen', 'Madison', 'Madisyn', 'Madonna', 'Madyson', 'Mae', 'Maegan', 'Maeve', 'Mafalda', 'Magali', 'Magdalen', 'Magdalena', 'Maggie', 'Magnolia', 'Magnus', 'Maia', 'Maida', 'Maiya', 'Major', 'Makayla', 'Makenna', 'Makenzie', 'Malachi', 'Malcolm', 'Malika', 'Malinda', 'Mallie', 'Mallory', 'Malvina', 'Mandy', 'Manley', 'Manuel', 'Manuela', 'Mara', 'Marc', 'Marcel', 'Marcelina', 'Marcelino', 'Marcella', 'Marcelle', 'Marcellus', 'Marcelo', 'Marcia', 'Marco', 'Marcos', 'Marcus', 'Margaret', 'Margarete', 'Margarett', 'Margaretta', 'Margarette', 'Margarita', 'Marge', 'Margie', 'Margot', 'Margret', 'Marguerite', 'Maria', 'Mariah', 'Mariam', 'Marian', 'Mariana', 'Mariane', 'Marianna', 'Marianne', 'Mariano', 'Maribel', 'Marie', 'Mariela', 'Marielle', 'Marietta', 'Marilie', 'Marilou', 'Marilyne', 'Marina', 'Mario', 'Marion', 'Marisa', 'Marisol', 'Maritza', 'Marjolaine', 'Marjorie', 'Marjory', 'Mark', 'Markus', 'Marlee', 'Marlen', 'Marlene', 'Marley', 'Marlin', 'Marlon', 'Marques', 'Marquis', 'Marquise', 'Marshall', 'Marta', 'Martin', 'Martina', 'Martine', 'Marty', 'Marvin', 'Mary', 'Maryam', 'Maryjane', 'Maryse', 'Mason', 'Mateo', 'Mathew', 'Mathias', 'Mathilde', 'Matilda', 'Matilde', 'Matt', 'Matteo', 'Mattie', 'Maud', 'Maude', 'Maudie', 'Maureen', 'Maurice', 'Mauricio', 'Maurine', 'Maverick', 'Mavis', 'Max', 'Maxie', 'Maxime', 'Maximilian', 'Maximillia', 'Maximillian', 'Maximo', 'Maximus', 'Maxine', 'Maxwell', 'May', 'Maya', 'Maybell', 'Maybelle', 'Maye', 'Maymie', 'Maynard', 'Mayra', 'Mazie', 'Mckayla', 'Mckenna', 'Mckenzie', 'Meagan', 'Meaghan', 'Meda', 'Megane', 'Meggie', 'Meghan', 'Mekhi', 'Melany', 'Melba', 'Melisa', 'Melissa', 'Mellie', 'Melody', 'Melvin', 'Melvina', 'Melyna', 'Melyssa', 'Mercedes', 'Meredith', 'Merl', 'Merle', 'Merlin', 'Merritt', 'Mertie', 'Mervin', 'Meta', 'Mia', 'Micaela', 'Micah', 'Michael', 'Michaela', 'Michale', 'Micheal', 'Michel', 'Michele', 'Michelle', 'Miguel', 'Mikayla', 'Mike', 'Mikel', 'Milan', 'Miles', 'Milford', 'Miller', 'Millie', 'Milo', 'Milton', 'Mina', 'Minerva', 'Minnie', 'Miracle', 'Mireille', 'Mireya', 'Misael', 'Missouri', 'Misty', 'Mitchel', 'Mitchell', 'Mittie', 'Modesta', 'Modesto', 'Mohamed', 'Mohammad', 'Mohammed', 'Moises', 'Mollie', 'Molly', 'Mona', 'Monica', 'Monique', 'Monroe', 'Monserrat', 'Monserrate', 'Montana', 'Monte', 'Monty', 'Morgan', 'Moriah', 'Morris', 'Mortimer', 'Morton', 'Mose', 'Moses', 'Moshe', 'Mossie', 'Mozell', 'Mozelle', 'Muhammad', 'Muriel', 'Murl', 'Murphy', 'Murray', 'Mustafa', 'Mya', 'Myah', 'Mylene', 'Myles', 'Myra', 'Myriam', 'Myrl', 'Myrna', 'Myron', 'Myrtice', 'Myrtie', 'Myrtis', 'Myrtle', 'Nadia', 'Nakia', 'Name', 'Nannie', 'Naomi', 'Naomie', 'Napoleon', 'Narciso', 'Nash', 'Nasir', 'Nat', 'Natalia', 'Natalie', 'Natasha', 'Nathan', 'Nathanael', 'Nathanial', 'Nathaniel', 'Nathen', 'Nayeli', 'Neal', 'Ned', 'Nedra', 'Neha', 'Neil', 'Nelda', 'Nella', 'Nelle', 'Nellie', 'Nels', 'Nelson', 'Neoma', 'Nestor', 'Nettie', 'Neva', 'Newell', 'Newton', 'Nia', 'Nicholas', 'Nicholaus', 'Nichole', 'Nick', 'Nicklaus', 'Nickolas', 'Nico', 'Nicola', 'Nicolas', 'Nicole', 'Nicolette', 'Nigel', 'Nikita', 'Nikki', 'Nikko', 'Niko', 'Nikolas', 'Nils', 'Nina', 'Noah', 'Noble', 'Noe', 'Noel', 'Noelia', 'Noemi', 'Noemie', 'Noemy', 'Nola', 'Nolan', 'Nona', 'Nora', 'Norbert', 'Norberto', 'Norene', 'Norma', 'Norris', 'Norval', 'Norwood', 'Nova', 'Novella', 'Nya', 'Nyah', 'Nyasia', 'Obie', 'Oceane', 'Ocie', 'Octavia', 'Oda', 'Odell', 'Odessa', 'Odie', 'Ofelia', 'Okey', 'Ola', 'Olaf', 'Ole', 'Olen', 'Oleta', 'Olga', 'Olin', 'Oliver', 'Ollie', 'Oma', 'Omari', 'Omer', 'Ona', 'Onie', 'Opal', 'Ophelia', 'Ora', 'Oral', 'Oran', 'Oren', 'Orie', 'Orin', 'Orion', 'Orland', 'Orlando', 'Orlo', 'Orpha', 'Orrin', 'Orval', 'Orville', 'Osbaldo', 'Osborne', 'Oscar', 'Osvaldo', 'Oswald', 'Oswaldo', 'Otha', 'Otho', 'Otilia', 'Otis', 'Ottilie', 'Ottis', 'Otto', 'Ova', 'Owen', 'Ozella', 'Pablo', 'Paige', 'Palma', 'Pamela', 'Pansy', 'Paolo', 'Paris', 'Parker', 'Pascale', 'Pasquale', 'Pat', 'Patience', 'Patricia', 'Patrick', 'Patsy', 'Pattie', 'Paul', 'Paula', 'Pauline', 'Paxton', 'Payton', 'Pearl', 'Pearlie', 'Pearline', 'Pedro', 'Peggie', 'Penelope', 'Percival', 'Percy', 'Perry', 'Pete', 'Peter', 'Petra', 'Peyton', 'Philip', 'Phoebe', 'Phyllis', 'Pierce', 'Pierre', 'Pietro', 'Pink', 'Pinkie', 'Piper', 'Polly', 'Porter', 'Precious', 'Presley', 'Preston', 'Price', 'Prince', 'Princess', 'Priscilla', 'Providenci', 'Prudence', 'Queen', 'Queenie', 'Quentin', 'Quincy', 'Quinn', 'Quinten', 'Quinton', 'Rachael', 'Rachel', 'Rachelle', 'Rae', 'Raegan', 'Rafael', 'Rafaela', 'Raheem', 'Rahsaan', 'Rahul', 'Raina', 'Raleigh', 'Ralph', 'Ramiro', 'Ramon', 'Ramona', 'Randal', 'Randall', 'Randi', 'Randy', 'Ransom', 'Raoul', 'Raphael', 'Raphaelle', 'Raquel', 'Rashad', 'Rashawn', 'Rasheed', 'Raul', 'Raven', 'Ray', 'Raymond', 'Raymundo', 'Reagan', 'Reanna', 'Reba', 'Rebeca', 'Rebecca', 'Rebeka', 'Rebekah', 'Reece', 'Reed', 'Reese', 'Regan', 'Reggie', 'Reginald', 'Reid', 'Reilly', 'Reina', 'Reinhold', 'Remington', 'Rene', 'Renee', 'Ressie', 'Reta', 'Retha', 'Retta', 'Reuben', 'Reva', 'Rex', 'Rey', 'Reyes', 'Reymundo', 'Reyna', 'Reynold', 'Rhea', 'Rhett', 'Rhianna', 'Rhiannon', 'Rhoda', 'Ricardo', 'Richard', 'Richie', 'Richmond', 'Rick', 'Rickey', 'Rickie', 'Ricky', 'Rico', 'Rigoberto', 'Riley', 'Rita', 'River', 'Robb', 'Robbie', 'Robert', 'Roberta', 'Roberto', 'Robin', 'Robyn', 'Rocio', 'Rocky', 'Rod', 'Roderick', 'Rodger', 'Rodolfo', 'Rodrick', 'Rodrigo', 'Roel', 'Rogelio', 'Roger', 'Rogers', 'Rolando', 'Rollin', 'Roma', 'Romaine', 'Roman', 'Ron', 'Ronaldo', 'Ronny', 'Roosevelt', 'Rory', 'Rosa', 'Rosalee', 'Rosalia', 'Rosalind', 'Rosalinda', 'Rosalyn', 'Rosamond', 'Rosanna', 'Rosario', 'Roscoe', 'Rose', 'Rosella', 'Roselyn', 'Rosemarie', 'Rosemary', 'Rosendo', 'Rosetta', 'Rosie', 'Rosina', 'Roslyn', 'Ross', 'Rossie', 'Rowan', 'Rowena', 'Rowland', 'Roxane', 'Roxanne', 'Roy', 'Royal', 'Royce', 'Rozella', 'Ruben', 'Rubie', 'Ruby', 'Rubye', 'Rudolph', 'Rudy', 'Rupert', 'Russ', 'Russel', 'Russell', 'Rusty', 'Ruth', 'Ruthe', 'Ruthie', 'Ryan', 'Ryann', 'Ryder', 'Rylan', 'Rylee', 'Ryleigh', 'Ryley', 'Sabina', 'Sabrina', 'Sabryna', 'Sadie', 'Sadye', 'Sage', 'Saige', 'Sallie', 'Sally', 'Salma', 'Salvador', 'Salvatore', 'Sam', 'Samanta', 'Samantha', 'Samara', 'Samir', 'Sammie', 'Sammy', 'Samson', 'Sandra', 'Sandrine', 'Sandy', 'Sanford', 'Santa', 'Santiago', 'Santina', 'Santino', 'Santos', 'Sarah', 'Sarai', 'Sarina', 'Sasha', 'Saul', 'Savanah', 'Savanna', 'Savannah', 'Savion', 'Scarlett', 'Schuyler', 'Scot', 'Scottie', 'Scotty', 'Seamus', 'Sean', 'Sebastian', 'Sedrick', 'Selena', 'Selina', 'Selmer', 'Serena', 'Serenity', 'Seth', 'Shad', 'Shaina', 'Shakira', 'Shana', 'Shane', 'Shanel', 'Shanelle', 'Shania', 'Shanie', 'Shaniya', 'Shanna', 'Shannon', 'Shanny', 'Shanon', 'Shany', 'Sharon', 'Shaun', 'Shawn', 'Shawna', 'Shaylee', 'Shayna', 'Shayne', 'Shea', 'Sheila', 'Sheldon', 'Shemar', 'Sheridan', 'Sherman', 'Sherwood', 'Shirley', 'Shyann', 'Shyanne', 'Sibyl', 'Sid', 'Sidney', 'Sienna', 'Sierra', 'Sigmund', 'Sigrid', 'Sigurd', 'Silas', 'Sim', 'Simeon', 'Simone', 'Sincere', 'Sister', 'Skye', 'Skyla', 'Skylar', 'Sofia', 'Soledad', 'Solon', 'Sonia', 'Sonny', 'Sonya', 'Sophia', 'Sophie', 'Spencer', 'Stacey', 'Stacy', 'Stan', 'Stanford', 'Stanley', 'Stanton', 'Stefan', 'Stefanie', 'Stella', 'Stephan', 'Stephania', 'Stephanie', 'Stephany', 'Stephen', 'Stephon', 'Sterling', 'Steve', 'Stevie', 'Stewart', 'Stone', 'Stuart', 'Summer', 'Sunny', 'Susan', 'Susana', 'Susanna', 'Susie', 'Suzanne', 'Sven', 'Syble', 'Sydnee', 'Sydney', 'Sydni', 'Sydnie', 'Sylvan', 'Sylvester', 'Sylvia', 'Tabitha', 'Tad', 'Talia', 'Talon', 'Tamara', 'Tamia', 'Tania', 'Tanner', 'Tanya', 'Tara', 'Taryn', 'Tate', 'Tatum', 'Tatyana', 'Taurean', 'Tavares', 'Taya', 'Taylor', 'Teagan', 'Ted', 'Telly', 'Terence', 'Teresa', 'Terrance', 'Terrell', 'Terrence', 'Terrill', 'Terry', 'Tess', 'Tessie', 'Tevin', 'Thad', 'Thaddeus', 'Thalia', 'Thea', 'Thelma', 'Theo', 'Theodora', 'Theodore', 'Theresa', 'Therese', 'Theresia', 'Theron', 'Thomas', 'Thora', 'Thurman', 'Tia', 'Tiana', 'Tianna', 'Tiara', 'Tierra', 'Tiffany', 'Tillman', 'Timmothy', 'Timmy', 'Timothy', 'Tina', 'Tito', 'Titus', 'Tobin', 'Toby', 'Tod', 'Tom', 'Tomas', 'Tomasa', 'Tommie', 'Toney', 'Toni', 'Tony', 'Torey', 'Torrance', 'Torrey', 'Toy', 'Trace', 'Tracey', 'Tracy', 'Travis', 'Travon', 'Tre', 'Tremaine', 'Tremayne', 'Trent', 'Trenton', 'Tressa', 'Tressie', 'Treva', 'Trever', 'Trevion', 'Trevor', 'Trey', 'Trinity', 'Trisha', 'Tristian', 'Tristin', 'Triston', 'Troy', 'Trudie', 'Trycia', 'Trystan', 'Turner', 'Twila', 'Tyler', 'Tyra', 'Tyree', 'Tyreek', 'Tyrel', 'Tyrell', 'Tyrese', 'Tyrique', 'Tyshawn', 'Tyson', 'Ubaldo', 'Ulices', 'Ulises', 'Una', 'Unique', 'Urban', 'Uriah', 'Uriel', 'Ursula', 'Vada', 'Valentin', 'Valentina', 'Valentine', 'Valerie', 'Vallie', 'Van', 'Vance', 'Vanessa', 'Vaughn', 'Veda', 'Velda', 'Vella', 'Velma', 'Velva', 'Vena', 'Verda', 'Verdie', 'Vergie', 'Verla', 'Verlie', 'Vern', 'Verna', 'Verner', 'Vernice', 'Vernie', 'Vernon', 'Verona', 'Veronica', 'Vesta', 'Vicenta', 'Vicente', 'Vickie', 'Vicky', 'Victor', 'Victoria', 'Vida', 'Vidal', 'Vilma', 'Vince', 'Vincent', 'Vincenza', 'Vincenzo', 'Vinnie', 'Viola', 'Violet', 'Violette', 'Virgie', 'Virgil', 'Virginia', 'Virginie', 'Vita', 'Vito', 'Viva', 'Vivian', 'Viviane', 'Vivianne', 'Vivien', 'Vivienne', 'Vladimir', 'Wade', 'Waino', 'Waldo', 'Walker', 'Wallace', 'Walter', 'Walton', 'Wanda', 'Ward', 'Warren', 'Watson', 'Wava', 'Waylon', 'Wayne', 'Webster', 'Weldon', 'Wellington', 'Wendell', 'Wendy', 'Werner', 'Westley', 'Weston', 'Whitney', 'Wilber', 'Wilbert', 'Wilburn', 'Wiley', 'Wilford', 'Wilfred', 'Wilfredo', 'Wilfrid', 'Wilhelm', 'Wilhelmine', 'Will', 'Willa', 'Willard', 'William', 'Willie', 'Willis', 'Willow', 'Willy', 'Wilma', 'Wilmer', 'Wilson', 'Wilton', 'Winfield', 'Winifred', 'Winnifred', 'Winona', 'Winston', 'Woodrow', 'Wyatt', 'Wyman', 'Xander', 'Xavier', 'Xzavier', 'Yadira', 'Yasmeen', 'Yasmin', 'Yasmine', 'Yazmin', 'Yesenia', 'Yessenia', 'Yolanda', 'Yoshiko', 'Yvette', 'Yvonne', 'Zachariah', 'Zachary', 'Zachery', 'Zack', 'Zackary', 'Zackery', 'Zakary', 'Zander', 'Zane', 'Zaria', 'Zechariah', 'Zelda', 'Zella', 'Zelma', 'Zena', 'Zetta', 'Zion', 'Zita', 'Zoe', 'Zoey', 'Zoie', 'Zoila', 'Zola', 'Zora', 'Zula'],

	last_names: ['Abbott', 'Abernathy', 'Abshire', 'Adams', 'Altenwerth', 'Anderson', 'Ankunding', 'Armstrong', 'Auer', 'Aufderhar', 'Bahringer', 'Bailey', 'Balistreri', 'Barrows', 'Bartell', 'Bartoletti', 'Barton', 'Bashirian', 'Batz', 'Bauch', 'Baumbach', 'Bayer', 'Beahan', 'Beatty', 'Bechtelar', 'Becker', 'Bednar', 'Beer', 'Beier', 'Berge', 'Bergnaum', 'Bergstrom', 'Bernhard', 'Bernier', 'Bins', 'Blanda', 'Blick', 'Block', 'Bode', 'Boehm', 'Bogan', 'Bogisich', 'Borer', 'Bosco', 'Botsford', 'Boyer', 'Boyle', 'Bradtke', 'Brakus', 'Braun', 'Breitenberg', 'Brekke', 'Brown', 'Bruen', 'Buckridge', 'Carroll', 'Carter', 'Cartwright', 'Casper', 'Cassin', 'Champlin', 'Christiansen', 'Cole', 'Collier', 'Collins', 'Conn', 'Connelly', 'Conroy', 'Considine', 'Corkery', 'Cormier', 'Corwin', 'Cremin', 'Crist', 'Crona', 'Cronin', 'Crooks', 'Cruickshank', 'Cummerata', 'Cummings', 'Dach', 'Daniel', 'Dare', 'Daugherty', 'Davis', 'Deckow', 'Denesik', 'Dibbert', 'Dickens', 'Dicki', 'Dickinson', 'Dietrich', 'Donnelly', 'Dooley', 'Douglas', 'Doyle', 'DuBuque', 'Durgan', 'Ebert', 'Effertz', 'Eichmann', 'Emard', 'Emmerich', 'Erdman', 'Ernser', 'Fadel', 'Fahey', 'Farrell', 'Fay', 'Feeney', 'Feest', 'Feil', 'Ferry', 'Fisher', 'Flatley', 'Frami', 'Franecki', 'Friesen', 'Fritsch', 'Funk', 'Gaylord', 'Gerhold', 'Gerlach', 'Gibson', 'Gislason', 'Gleason', 'Gleichner', 'Glover', 'Goldner', 'Goodwin', 'Gorczany', 'Gottlieb', 'Goyette', 'Grady', 'Graham', 'Grant', 'Green', 'Greenfelder', 'Greenholt', 'Grimes', 'Gulgowski', 'Gusikowski', 'Gutkowski', 'Gutmann', 'Haag', 'Hackett', 'Hagenes', 'Hahn', 'Haley', 'Halvorson', 'Hamill', 'Hammes', 'Hand', 'Hane', 'Hansen', 'Harber', 'Harris', 'Hartmann', 'Harvey', 'Hauck', 'Hayes', 'Heaney', 'Heathcote', 'Hegmann', 'Heidenreich', 'Heller', 'Herman', 'Hermann', 'Hermiston', 'Herzog', 'Hessel', 'Hettinger', 'Hickle', 'Hilll', 'Hills', 'Hilpert', 'Hintz', 'Hirthe', 'Hodkiewicz', 'Hoeger', 'Homenick', 'Hoppe', 'Howe', 'Howell', 'Hudson', 'Huel', 'Huels', 'Hyatt', 'Jacobi', 'Jacobs', 'Jacobson', 'Jakubowski', 'Jaskolski', 'Jast', 'Jenkins', 'Jerde', 'Jewess', 'Johns', 'Johnson', 'Johnston', 'Jones', 'Kassulke', 'Kautzer', 'Keebler', 'Keeling', 'Kemmer', 'Kerluke', 'Kertzmann', 'Kessler', 'Kiehn', 'Kihn', 'Kilback', 'King', 'Kirlin', 'Klein', 'Kling', 'Klocko', 'Koch', 'Koelpin', 'Koepp', 'Kohler', 'Konopelski', 'Koss', 'Kovacek', 'Kozey', 'Krajcik', 'Kreiger', 'Kris', 'Kshlerin', 'Kub', 'Kuhic', 'Kuhlman', 'Kuhn', 'Kulas', 'Kunde', 'Kunze', 'Kuphal', 'Kutch', 'Kuvalis', 'Labadie', 'Lakin', 'Lang', 'Langosh', 'Langworth', 'Larkin', 'Larson', 'Leannon', 'Lebsack', 'Ledner', 'Leffler', 'Legros', 'Lehner', 'Lemke', 'Lesch', 'Leuschke', 'Lind', 'Lindgren', 'Littel', 'Little', 'Lockman', 'Lowe', 'Lubowitz', 'Lueilwitz', 'Luettgen', 'Lynch', 'Macejkovic', 'Maggio', 'Mann', 'Mante', 'Marks', 'Marquardt', 'Marvin', 'Mayer', 'Mayert', 'McClure', 'McCullough', 'McDermott', 'McGlynn', 'McKenzie', 'McLaughlin', 'Medhurst', 'Mertz', 'Metz', 'Miller', 'Mills', 'Mitchell', 'Moen', 'Mohr', 'Monahan', 'Moore', 'Morar', 'Morissette', 'Mosciski', 'Mraz', 'Mueller', 'Muller', 'Murazik', 'Murphy', 'Murray', 'Nader', 'Nicolas', 'Nienow', 'Nikolaus', 'Nitzsche', 'Nolan', 'Oberbrunner','Okuneva', 'Olson', 'Ondricka','Orn', 'Ortiz', 'Osinski', 'Pacocha', 'Padberg', 'Pagac', 'Parisian', 'Parker', 'Paucek', 'Pfannerstill', 'Pfeffer', 'Pollich', 'Pouros', 'Powlowski', 'Predovic', 'Price', 'Prohaska', 'Prosacco', 'Purdy', 'Quigley', 'Quitzon', 'Rath', 'Ratke', 'Rau', 'Raynor', 'Reichel', 'Reichert', 'Reilly', 'Reinger', 'Rempel', 'Renner', 'Reynolds', 'Rice', 'Rippin', 'Ritchie', 'Robel', 'Roberts', 'Rodriguez', 'Rogahn', 'Rohan', 'Rolfson', 'Romaguera', 'Roob', 'Rosenbaum', 'Rowe', 'Ruecker', 'Runolfsdottir', 'Runolfsson', 'Runte', 'Russel', 'Rutherford', 'Ryan', 'Sanford', 'Satterfield', 'Sauer', 'Sawayn', 'Schaden', 'Schaefer', 'Schamberger', 'Schiller', 'Schimmel', 'Schinner', 'Schmeler', 'Schmidt', 'Schmitt', 'Schneider', 'Schoen', 'Schowalter', 'Schroeder', 'Schulist', 'Schultz', 'Schumm', 'Schuppe', 'Schuster', 'Senger', 'Shanahan', 'Shields', 'Simonis', 'Sipes', 'Skiles', 'Smith', 'Smitham', 'Spencer', 'Spinka', 'Sporer', 'Stamm', 'Stanton', 'Stark', 'Stehr', 'Steuber', 'Stiedemann', 'Stokes', 'Stoltenberg', 'Stracke', 'Streich', 'Stroman', 'Strosin', 'Swaniawski', 'Swift', 'Terry', 'Thiel', 'Thompson', 'Tillman', 'Torp', 'Torphy', 'Towne', 'Toy', 'Trantow', 'Tremblay', 'Treutel', 'Tromp', 'Turcotte', 'Turner', 'Ullrich', 'Upton', 'Vandervort', 'Veum', 'Volkman', 'Von', 'VonRueden', 'Waelchi', 'Walker', 'Walsh', 'Walter', 'Ward', 'Waters', 'Watsica', 'Weber', 'Wehner', 'Weimann', 'Weissnat', 'Welch', 'West', 'White', 'Wiegand', 'Wilderman', 'Wilkinson', 'Will', 'Williamson', 'Willms', 'Windler', 'Wintheiser', 'Wisoky', 'Wisozk', 'Witting', 'Wiza', 'Wolf', 'Wolff', 'Wuckert', 'Wunsch', 'Wyman', 'Yost', 'Yundt', 'Zboncak', 'Zemlak', 'Ziemann', 'Zieme', 'Zulauf'],

	username_formats: [
		'{{last_name}}.{{first_name}}',
		'{{first_name}}.{{last_name}}',
		'{{first_name}}_{{last_name}}',
		'{{last_name}}_{{first_name}}'
	],

	name_formats: [
		'{{name_prefix}} {{full_name}}'
	],

	full_name_formats: [
		'{{first_name}} {{last_name}}'
	],

	company_name_formats: [
		'{{last_name}} {{company_suffix}}'
	],

	name: function() {
		return this.populate_one_of(this.name_formats);
	},

	username: function() {
		return this.populate_one_of(this.username_formats);
	},

	full_name: function() {
		return this.populate_one_of(this.full_name_formats);
	},

	first_name: function() {
		return this.random_element(this.first_names);
	},

	last_name: function() {
		return this.random_element(this.last_names);
	},

	password: function() {
		return this.numerify('#' + this.first_name + '##');
	},

	phone: function() {
		return this.numerify(this.random_element(this.phone_formats));
	},

	name_prefix: function() {
		return this.random_element(this.prefix);
	},

	name_suffix: function() {
		return this.random_element(this.suffix);
	},

	company_suffix: function() {
		return this.random_element(this.company_suffixes);
	},

	company_name: function() {
		return this.populate_one_of(this.company_name_formats);
	},

	catch_phrase: function() {
		var result = [];

		for (var i in this.catch_phrase_words) {
			result.push(this.random_element(this.catch_phrase_words[i]));
		}

        return result.join(' ');
	}
};

module.exports = provider;

},{}],15:[function(require,module,exports){
var first_letter_up = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

var provider = {
	words_list: [
		'alias', 'consequatur', 'aut', 'perferendis', 'sit', 'voluptatem',
		'accusantium', 'doloremque', 'aperiam', 'eaque','ipsa', 'quae', 'ab',
		'illo', 'inventore', 'veritatis', 'et', 'quasi', 'architecto',
		'beatae', 'vitae', 'dicta', 'sunt', 'explicabo', 'aspernatur', 'aut',
		'odit', 'aut', 'fugit', 'sed', 'quia', 'consequuntur', 'magni',
		'dolores', 'eos', 'qui', 'ratione', 'voluptatem', 'sequi', 'nesciunt',
		'neque', 'dolorem', 'ipsum', 'quia', 'dolor', 'sit', 'amet',
		'consectetur', 'adipisci', 'velit', 'sed', 'quia', 'non', 'numquam',
		'eius', 'modi', 'tempora', 'incidunt', 'ut', 'labore', 'et', 'dolore',
		'magnam', 'aliquam', 'quaerat', 'voluptatem', 'ut', 'enim', 'ad',
		'minima', 'veniam', 'quis', 'nostrum', 'exercitationem', 'ullam',
		'corporis', 'nemo', 'enim', 'ipsam', 'voluptatem', 'quia', 'voluptas',
		'sit', 'suscipit', 'laboriosam', 'nisi', 'ut', 'aliquid', 'ex', 'ea',
		'commodi', 'consequatur', 'quis', 'autem', 'vel', 'eum', 'iure',
		'reprehenderit', 'qui', 'in', 'ea', 'voluptate', 'velit', 'esse',
		'quam', 'nihil', 'molestiae', 'et', 'iusto', 'odio', 'dignissimos',
		'ducimus', 'qui', 'blanditiis', 'praesentium', 'laudantium', 'totam',
		'rem', 'voluptatum', 'deleniti', 'atque', 'corrupti', 'quos',
		'dolores', 'et', 'quas', 'molestias', 'excepturi', 'sint',
		'occaecati', 'cupiditate', 'non', 'provident', 'sed', 'ut',
		'perspiciatis', 'unde', 'omnis', 'iste', 'natus', 'error',
		'similique', 'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt',
		'mollitia', 'animi', 'id', 'est', 'laborum', 'et', 'dolorum', 'fuga',
		'et', 'harum', 'quidem', 'rerum', 'facilis', 'est', 'et', 'expedita',
		'distinctio', 'nam', 'libero', 'tempore', 'cum', 'soluta', 'nobis',
		'est', 'eligendi', 'optio', 'cumque', 'nihil', 'impedit', 'quo',
		'porro', 'quisquam', 'est', 'qui', 'minus', 'id', 'quod', 'maxime',
		'placeat', 'facere', 'possimus', 'omnis', 'voluptas', 'assumenda',
		'est', 'omnis', 'dolor', 'repellendus', 'temporibus', 'autem',
		'quibusdam', 'et', 'aut', 'consequatur', 'vel', 'illum', 'qui',
		'dolorem', 'eum', 'fugiat', 'quo', 'voluptas', 'nulla', 'pariatur',
		'at', 'vero', 'eos', 'et', 'accusamus', 'officiis', 'debitis', 'aut',
		'rerum', 'necessitatibus', 'saepe', 'eveniet', 'ut', 'et',
		'voluptates', 'repudiandae', 'sint', 'et', 'molestiae', 'non',
		'recusandae', 'itaque', 'earum', 'rerum', 'hic', 'tenetur', 'a',
		'sapiente', 'delectus', 'ut', 'aut', 'reiciendis', 'voluptatibus',
		'maiores', 'doloribus', 'asperiores', 'repellat'
	],

	letters: 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM',

	phonetics: [
		'Alfa', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel',
		'India', 'Juliett', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa',
		'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey',
		'X-ray', 'Yankee', 'Zulu'
	],

	title: function() {
		return first_letter_up(this.words(this.integer(2, 3)));
	},

	sentence: function() {
		return first_letter_up(this.words(this.integer(3, 10))) + '.';
	},

	text: function() {
		return this.sentences(this.integer(3, 6));
	},

	description: function() {
		return this.sentences(this.integer(2, 5));
	},

	short_description: function() {
		return this.sentence;
	},

	string: function() {
		return this.words();
	},

	sentences: function(n) {
		n = n || 3;

		var result = [];
		for (var i = 0; i < n; ++i) {
			result.push(this.sentence);
		}

		return result.join(' ');
	},

	word: function() {
		return this.random_element(this.words_list);
	},

	words: function(n) {
		return this.array_of_words(n).join(' ');
	},

	array_of_words: function(n) {
		n = n || 7;
		var result = [];

		for (var i = 0; i < n; ++i) {
			result.push(this.word);
		}

		return result;
	},

	letter: function() {
		return this.random_element(this.letters);
	},

	letter_phonetic: function() {
		return this.random_element(this.phonetics);
	}
};

module.exports = provider;

},{}]},{},[4]);
