var Tree = {};
Tree.selectNextNode = function(tree) {
    var selected = Tree.findSelected(tree);
    var next = Tree.findNextNode(selected);
    if (next) {
        if (selected) {
            selected.selected = undefined;
        }
        next.selected = true;
    }
};

Tree.selectPreviousNode = function(tree) {
    var selected = Tree.findSelected(tree);
    var previous = Tree.findPreviousNode(selected);
    if (previous) {
        if (previous) {
            selected.selected = undefined;
        }
        previous.selected = true;
    }
};

// Add a child at "selected"
Tree.addChild = function(tree) {

}

Tree.findDeepest = function(tree) {
    if (tree.childNodes && tree.childNodes.length > 0) {
        return Tree.findDeepest(tree.childNodes[tree.childNodes.length - 1]);
    }
    return tree;
};

Tree.findSelected = function(node) {
    if (node.selected) {
        return node;
    }
    for (var i = 0; i < node.childNodes.length; i++) {
        var found = Tree.findSelected(node.childNodes[i]);
        if (found) {
            return found;
        }
    }
    return null;
};

Tree.findNextNode = function(tree) {
    if (tree.childNodes && tree.childNodes.length > 0) {
        return tree.childNodes[0];
    }
    return Tree.findNextNodeRec(tree);
};

Tree.findPreviousNode = function(tree) {
    if (!tree || !tree.parent) {
        return null;
    }
    var i = 0;
    for (i = 0; i < tree.parent.childNodes.length; i++) {
        if (tree.parent.childNodes[i] == tree) {
            break;
        }
    }
    if (i - 1 >= 0) {
        return Tree.findDeepest(tree.parent.childNodes[i - 1]);
    }
    return tree.parent;
};

Tree.findNextNodeRec = function(tree) {
    if (!tree || !tree.parent) {
        return null;
    }
    var i = 0;
    for (i = 0; i < tree.parent.childNodes.length; i++) {
        if (tree.parent.childNodes[i] == tree) {
            break;
        }
    }
    if (i + 1 < tree.parent.childNodes.length) {
        return tree.parent.childNodes[i + 1];
    }
    return Tree.findNextNodeRec(tree.parent);
};


Tree.findPreviousNodeRec = function(tree) {
    if (!tree || !tree.parent) {
        return null;
    }
    var i = 0;
    for (i = 0; i < tree.parent.childNodes.length; i++) {
        if (tree.parent.childNodes[i] == tree) {
            break;
        }
    }
    if (i - 1 >= 0) {
        return tree.parent.childNodes[i - 1];
    }
    return Tree.findPreviousNodeRec(tree.parent);
}

Tree.makeTree = function(node, parent) {
    var me = {title: node.title, selected: node.selected, childNodes: [], parent: parent};
    if (node.childNodes) {
        me.childNodes = node.childNodes.map(function (node) {
            return Tree.makeTree(node, me);
        });
    }
    return me;
};

define([], function() {
  return Tree;
});
