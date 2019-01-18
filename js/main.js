var ReactTree = require('./ReactTree');
var Tree = require('./lib/Tree');
var ImportUtils = require('./lib/ImportUtils');
var config = require('./config');
var FakeParseTree = require('./lib/FakeParseTree');

if (config.use_parse) {
	var Parse = require('parse').Parse;
	Parse.initialize(config.parse_app_id, config.parse_js_key);
	var First = Parse.Object.extend('first');
	var query = new Parse.Query(First);
	query.get(config.parse_id, {
		success: function(parseTree) {
			ReactTree.startRender(parseTree);
		},
		error: function(obj, error) {
			throw 'Error loading tree' + obj + error;
		}
	});
} else {
	ImportUtils.opmlToTree(ImportUtils.sampleOpml, function(tree) {
		ReactTree.startRender(new FakeParseTree(Tree.toString(tree)));
	});
}
