var Config = require("../config");
var expect = require('chai').expect;
var sinon = require("sinon");
var chainsinon = require("chainsinon");

describe("Config.js", function() {
	beforeEach(function() {
		process.env.DARKROLL_ENV = "test";
	});

	describe("get()", function() {
		it("returns the environment variable if it exists", function() {
			process.env.FOOBAR = "bar";
			expect(Config.get("foobar")).to.equal("bar");
			delete process.env.FOOBAR;
		});

		it("overrides an existing variable", function() {
			process.env.BR_IP = "bar";
			expect(Config.get("br_ip")).to.equal("bar");
			delete process.env.BR_IP;
		});

		it("automatically converts a variable to an integer if it looks like one", function() {
			process.env.FOOBAR = "5";
			expect(Config.get("foobar")).to.equal(5);
			delete process.env.FOOBAR;
		});

		it("automitically converts true to boolean", function() {
			process.env.FOOBAR = "true";
			expect(Config.get("foobar")).to.equal(true);
			delete process.env.FOOBAR;
		});

		it("automitically converts false to boolean", function() {
			process.env.FOOBAR = "false";
			expect(Config.get("foobar")).to.equal(false);
			delete process.env.FOOBAR;
		});

		it("returns undefined if no variable exists", function() {
			expect(Config.get("foobar")).to.be.undefined;
		});

		it("Doesn't convert IP addresses to integers", function() {
			process.env.FOOBAR = "192.168.15.18";
			expect(Config.get("foobar")).to.equal("192.168.15.18");
			delete process.env.FOOBAR;
		});
	});

	describe("getNestedValue()", function() {
		it("Returns the configured value if it exists", function(){
			var value = Config.getNestedValue("nestingDefaultsTest", ['baz', 'caesar'], "foo"); 			
			expect(value[0]).to.equal("gaul");
		});
		it("Returns the configured default value if getNestedValue is called and there is no match", function(){
			var value = Config.getNestedValue("nestingDefaultsTest", ['qux'], "foo"); 			
			expect(value).to.equal("bar");
		});
		it("Returns the configured default value if getNestedValue is called and there is no match for a nested value", function(){
			var value = Config.getNestedValue("nestingDefaultsTest", ["baz", "alexander"], "foo"); 			
			expect(value[0]).to.equal("sparta");
			expect(value[1]).to.equal("athens");
		});
		it("Returns the default parameter value if getNestedValue is called and there is no match for a nested value and no configured default", function(){
			var value = Config.getNestedValue("nestingDefaultsTestWithoutDefault", ["qux"], "foo"); 			
			expect(value).to.equal("foo");
		});
	});

	describe("withRequest()", function() {
		it("returns test env value with no express request params", function() {
			var request = {
				query: {}
			};
			debugger;
			var val = Config.withRequest(request).some_var;
			expect(val).to.equal(true);
		});

		it("returns custom env value with no express request params", function() {
			var request = {
				query: {
					env: "test-two"
				}
			};
			var val = Config.withRequest(request).some_var;
			expect(val).to.equal(false);
		});

		it("returns env value with oden env=test-two request param", function() {
			var request = chainsinon("queryMap.at");
			request["queryMap.at"].returns("test-two");
			var val = Config.withRequest(request).some_var;
			expect(val).to.equal(false);
		});

		it("returns default env value with oden env=fake request param", function() {
			var request = chainsinon("queryMap.at");
			request["queryMap.at"].returns("fake");
			var val = Config.withRequest(request).some_var;
			expect(val).to.equal(true);
		});
	});
});
