var FakeParseTree = function(tree) {
	this.tree = tree;
};
FakeParseTree.prototype.get = function(prop) {
	console.assert(prop === 'tree');
	return this.tree;
};
FakeParseTree.prototype.set = function() {};
FakeParseTree.prototype.save = function() {};
module.exports = exports = FakeParseTree;
