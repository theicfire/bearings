$ = require('jquery');
var React= require('React');
var Tree = require('../lib/Tree');
var FastRenderTree = {};

/*
 * Even a change of text is a delete/insert operation
 * Delete references the oldTree's uuids.
 * Insert references the newTree's uuids.
 */
FastRenderTree.diff = function(oldTree, newTree) {
    var ret = {};
    if (!FastRenderTree.nodeEquals(newTree.uuidMap[newTree.selected], oldTree.uuidMap[newTree.selected])) {
        ret.insert = [newTree.selected];
    }
    if (!FastRenderTree.nodeEquals(newTree.uuidMap[oldTree.selected], oldTree.uuidMap[oldTree.selected])) {
        ret['delete'] = [oldTree.selected];
    }
    return ret;
};

/*
 * If the node title and location in the tree is the same, return true, else false
 */
FastRenderTree.nodeEquals = function(t1, t2) {
    if (t1 === undefined && t2 !== undefined) {
        return false;
    }
    if (t2 === undefined && t1 !== undefined) {
        return false;
    }
    return t1.title === t2.title && FastRenderTree.getPath(t1) == FastRenderTree.getPath(t2);
};

FastRenderTree.getPath = function(tree) {
    if (tree.title === 'special_root_title') {
        return ''; // TODO hacky, because of the substr in findFromIndexer
    }

    // TODO put in some utils
    var reverse = function(s) {
      var o = '';
      for (var i = s.length - 1; i >= 0; i--)
        o += s[i];
      return o;
    };

    var getReversePath = function(tree) {
        if (tree.parent.title === 'special_root_title') {
            return Tree.findChildNum(tree) + '-'; // TODO hacky. Appending this because of TreeNode.js
        }
        return Tree.findChildNum(tree) + '-' + getReversePath(tree.parent);
    };

    return reverse(getReversePath(tree));
};

FastRenderTree.operations = function(oldTree, newTree, diff) {
    return [
        {del: 'uuid1'},
        {at: 'uuid2', insertAfter: 'uuid3'},
        {at: 'uuid2', insertBefore: 'uuid3'}
    ];
};

FastRenderTree.applyOperations = function(oldTree, newTree, operations) {
    operations.forEach(function(operation) {
        if (operation.hasOwnProperty('del')) {
            $('#' + operation.del).remove();
        } else if (operation.hasOwnProperty('insertAfter')) {
            var newEl = FastRenderTree.makeDom(newTree, operation.insertAfter);
            $('#' + operation.at).insertAfter(newEl);
        } else if (operation.hasOwnProperty('insertBefore')) {
            var newEl = $(FastRenderTree.makeDom(newTree, operation.insertBefore));
            console.log('adding', newEl, 'before', $('#' + operation.at));
            newEl.insertBefore('#' + operation.at);
        }
    });
};

FastRenderTree.cool = function() {
    var one = Tree.clone(globalTree);
    one.selected = one.childNodes[0].uuid;
    var two = Tree.clone(one);
    two.childNodes[0].title = 'something else';
    console.log('delete title of', one.childNodes[0].title);
    console.log('at', two.childNodes[1].title);
    console.log('add before', two.childNodes[0].title);
    React.unmountComponentAtNode($('base-react'));
    var ops = [{del: one.childNodes[0].uuid},
        {at: two.childNodes[1].uuid, insertBefore: two.childNodes[0].uuid}];
    FastRenderTree.applyOperations(one, two, ops);
};



fa = FastRenderTree; // TODO remove
module.exports = FastRenderTree;
