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

window.casual = module.exports;
