var _ = require('underscore');
var $ = require('jquery');
var StartRender = require('./ReactTree');
var Tree = require('./lib/Tree');
var Parse = require('parse').Parse;
Parse.initialize("R7ngCzUNFlUFW2jZO90HfG7Pgr8Roa0dgIsFknNJ", "hvTrWozZrInn3qmEuE2zlscYBNRwUWjkndcIwIOL");


var TestObject = Parse.Object.extend("TestObject");
var query = new Parse.Query(TestObject);
query.get("qJbAFzSI53", {
    success: function (parseTree) {
        StartRender(parseTree);
    },
    error: function(obj, error) {
        throw('Error loading tree' + obj + error);
    }
});

