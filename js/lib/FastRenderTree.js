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
    // If old selected is not equal, delete
    if (!FastRenderTree.nodeEquals(newTree.uuidMap[oldTree.selected], oldTree.uuidMap[oldTree.selected])) {
        ret['delete'] = [oldTree.selected];
        if (newTree.uuidMap[oldTree.selected] !== undefined) {
            ret.insert = [oldTree.selected];
        }
    }
    if (oldTree.selected !== newTree.selected &&
        !FastRenderTree.nodeEquals(newTree.uuidMap[newTree.selected], oldTree.uuidMap[newTree.selected])) {
        if (!ret.hasOwnProperty('insert')) {
            ret.insert = [];
        }
        ret.insert.push(newTree.selected);
    }
    return ret;
};

/*
 * If the node title and location in the tree is the same, return true, else false
 */
FastRenderTree.nodeEquals = function(t1, t2) {
    //console.log('nodeEquals', t1, t2);
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

// TODO just call diff inside of this
FastRenderTree.operations = function(oldTree, newTree, diff) {
    var ret = [];
    if (diff.hasOwnProperty('delete')) {
        ret.push({del: diff['delete'][0]});
    }
    if (diff.hasOwnProperty('insert')) {
        var insertTree = newTree.uuidMap[diff['insert'][0]];
        console.log('loook for', insertTree);
        var childNum = Tree.findChildNum(insertTree);
        if (childNum === 0) {
            console.assert(insertTree.parent.childNodes.length > 0);
            if (insertTree.parent.childNodes.length === 1) {
                // Need to return a "insertChild" thing...
                ret.push({insertChild: insertTree.parent.uuid, newUUID: diff['insert'][0]});
            } else {
                var nextUUID = insertTree.parent.childNodes[1].uuid;
                ret.push({insertBefore: nextUUID, newUUID: diff['insert'][0]});
            }
        } else {
            ret.push({insertAfter: insertTree.parent.childNodes[0].uuid, newUUID: diff['insert'][0]});
        }
    }
    return ret;
};

//FastRenderTree.cool = function() {
    //var one = Tree.clone(globalTree);
    //one.selected = one.childNodes[0].uuid;
    //var two = Tree.clone(one);
    //two.childNodes[0].title = 'something else';
    //console.log('delete title of', one.childNodes[0].title);
    //console.log('at', two.childNodes[1].title);
    //console.log('add before', two.childNodes[0].title);
    //React.unmountComponentAtNode($('base-react'));
    //var ops = [{del: one.childNodes[0].uuid},
        //{at: two.childNodes[1].uuid, insertBefore: two.childNodes[0].uuid}];
    //FastRenderTree.applyOperations(one, two, ops);
//};

fa = FastRenderTree; // TODO remove
module.exports = FastRenderTree;
