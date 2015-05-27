var _ = require('underscore');
var $ = require('jquery');
var ReactTree = require('./ReactTree');
var Tree = require('./lib/Tree');
var config = require('./config');
var FakeParseTree = require('./lib/FakeParseTree');
var FastRenderTree = require('./lib/FastRenderTree');
console.log('ReactTree is', ReactTree);

if (config.use_parse) {
    var Parse = require('parse').Parse;
    Parse.initialize(config.parse_app_id,config.parse_js_key);
    var First = Parse.Object.extend("first");
    var query = new Parse.Query(First);
    query.get(config.parse_id, {
        success: function (parseTree) {
            ReactTree.startRender(parseTree);
        },
        error: function(obj, error) {
            throw('Error loading tree' + obj + error);
        }
    });
} else {
    ReactTree.startRender(new FakeParseTree(Tree.toString(Tree.makeDefaultTree())));
}
