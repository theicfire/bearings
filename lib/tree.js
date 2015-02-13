var Tree = {};
Tree.selectNextNode = function(tree) {
    var selected = Tree.findSelected(tree);
    var next = Tree.findNextNode(selected);
    if (next) {
        if (selected) {
            delete selected.selected;
        }
        next.selected = true;
    }
};

Tree.selectPreviousNode = function(tree) {
    var selected = Tree.findSelected(tree);
    var previous = Tree.findPreviousNode(selected);
    if (previous) {
        if (previous) {
            delete selected.selected;
        }
        previous.selected = true;
    }
};

// TODO what if there's no parent?
Tree.appendSibling = function(tree, title) {
    var i;
    for (i = 0; i < tree.parent.childNodes.length; i++) {
        if (tree.parent.childNodes[i] == tree) {
            break;
        }
    }
    var ret = {title: title, childNodes: [], parent: tree.parent};
    tree.parent.childNodes.splice(i + 1, 0, ret);
    return ret;
};

Tree.newLineAtCursor = function(tree) {
    var selected = Tree.findSelected(tree);
    var start = selected.title.substr(0, selected.caretLoc);
    var rest = selected.title.substr(selected.caretLoc);
    selected.title = start;
    var nextNode = Tree.appendSibling(selected, rest);
    if (start.length > 0) {
        delete selected.selected;
        delete selected.caretLoc;
        nextNode.selected = true;
        selected = nextNode;
    }
    selected.caretLoc = 0;
};

Tree.backspaceAtBeginning = function(tree) {
    var selected = Tree.findSelected(tree);
    console.assert(selected.caretLoc === 0);
    var i;
    console.log('remove', selected);
    var previous = Tree.findPreviousNode(selected);
    var oldTitle = selected.title;
    for (i = 0; i < selected.parent.childNodes.length; i++) {
        if (selected.parent.childNodes[i] == selected) {
            console.log('fouuuud');
            break;
        }
    }
    console.log('before', selected.parent.childNodes);
    console.log('i is', i);
    selected.parent.childNodes.splice(i, 1);
    console.log('after', selected.parent.childNodes);
    previous.selected = true;
    previous.caretLoc = previous.title.length;
    previous.title += oldTitle;
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
    var me = {title: node.title, childNodes: [], parent: parent};
    if (node.selected !== undefined) {
        me.selected = node.selected;
    }
    if (node.caretLoc !== undefined) {
        me.caretLoc = node.caretLoc;
    }
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
