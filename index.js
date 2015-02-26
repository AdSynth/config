var ideal = require("ideal");
var fs = require("fs");
var yaml = require("js-yaml");

var defaultEnvironment = "local";
var doc;

module.exports.loadConfigAtPath = function(path) {
	var fileContents = fs.readFileSync(path,"utf8");
	doc = yaml.safeLoad(fileContents);

};

module.exports.getEnvironment = function()
{
	return process.env.DARKROLL_ENV || defaultEnvironment;
};

module.exports.get = function(name)
{
	if (null != process.env[name.toUpperCase()]) {
		var result = process.env[name.toUpperCase()];
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

	if (undefined != process.env.DARKROLL_ENV) {
		return doc[process.env.DARKROLL_ENV][name];
	}

	return doc[defaultEnvironment][name];
}

module.exports.set = function(name, value)
{
	if (undefined != process.env.DARKROLL_ENV) {
		doc[process.env.DARKROLL_ENV][name] = value
	}
	else {
		doc[defaultEnvironment][name] = value;
	}
}

module.exports.withRequest = function(request)
{
	var env = module.exports.getEnvironment();
	// support express and oden style queries:
	if ('queryMap' in request)
	{
		env = request.queryMap().at("env");
	}
	else if (request.query && "env" in request.query)
	{
		env = request.query.env;
	}

	if (doc[env])
	{
		return doc[env];
	}
	else
	{
		return doc[module.exports.getEnvironment()];
	}
};

module.exports.version = function()
{
	if (module.exports.get("return_js_version"))
	{
		return process.env.DARKROLL_VERSION;
	}
	else
	{
		throw "version() shouldn't be called if 'return_js_version' is false."
	}
};
