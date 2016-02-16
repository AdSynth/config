var ideal = require("ideal");
var fs = require("fs");
var yaml = require("js-yaml");
var lodash_ext = require('./lodash_ext');
var _ = require('lodash');

var defaultEnvironment = "local";

var fileContents = fs.readFileSync("config.yml","utf8");
var doc = yaml.safeLoad(fileContents);

module.exports.getEnvironment = function() {
	return process.env.DARKROLL_ENV || defaultEnvironment;
};

module.exports.get = function(name) {
	var result = process.env[name.toUpperCase()];
	if (result !== null && result !== undefined) {
		if (result.match(/^\d+$/)) {
			return parseInt(result);
		}
		if (result === "true") {
			return true;
		}
		if (result === "false") {
			return false;
		}
		return result;
	}

	if (undefined !== process.env.DARKROLL_ENV) {
		return doc[process.env.DARKROLL_ENV][name];
	}

	return doc[defaultEnvironment][name];
};

module.exports.set = function(name, value) {
	if (undefined !== process.env.DARKROLL_ENV) {
		doc[process.env.DARKROLL_ENV][name] = value;
	} else {
		doc[defaultEnvironment][name] = value;
	}
};

module.exports.withRequest = function(request) {
	var env = module.exports.getEnvironment();
	// support express and oden style queries:
	if ('queryMap' in request) {
		env = request.queryMap().at("env");
	} else if (request.query && "env" in request.query) {
		env = request.query.env;
	}

	if (doc[env]) {
		return doc[env];
	} else {
		return doc[module.exports.getEnvironment()];
	}
};

module.exports.version = function() {
	if (module.exports.get("return_js_version")) {
		return process.env.DARKROLL_VERSION;
	} else {
		throw "version() shouldn't be called if 'return_js_version' is false.";
	}
};

module.exports.getNestedValue = function(name, properties, defaultValue) {
	var object = this.get(name);		
	if(undefined === object) {
		return defaultValue;	
	}
	if(properties.length === 0) {
		return object;	
	}
	var result = lodash_ext.getNestedValue(object, properties, defaultValue);
	if(defaultValue !== result) {
		return result;	
	}

	// The desired value doesn't appear to exist
	// so let's see if there's a default up the 
	// tree.
	var resortToDefault = function(properties) {
		var props = properties.slice(0);
		props[props.length] = "default";
		var configDefault = lodash_ext.getNestedValue(object, props, null);
		if(null !== configDefault) {
			return configDefault;
		}
		else if (properties.length === 0) {
			if(undefined !== object["default"])	{
				return object["default"];	
			} else {
				return defaultValue;	
			}
		} else {
			return resortToDefault(properties.slice(0, properties.length - 1));
		}
	};
	return resortToDefault(properties);
};
