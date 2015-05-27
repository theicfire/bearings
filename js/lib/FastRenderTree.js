$ = require('jquery');
var ReactTree = require('../ReactTree');
var React= require('React');
/*
 * Make the dom of a given uuid for some tree.
 * Will recursively create it.
 */
var FastRenderTree = {};
FastRenderTree.makeDom = function(tree, uuid) {
    var root = Tree.getRoot(tree);
    return ReactTree.tree_to_html(root.uuidMap[uuid]);
};

/*
 * Even a change of text is a delete/insert operation
 * Delete references the oldTree's uuids.
 * Insert references the newTree's uuids.
 */
FastRenderTree.diff = function(oldTree, newTree) {
    return {
        insert: ['uuid1', 'uuid2'],
        delete: ['uuid3']
    }
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
