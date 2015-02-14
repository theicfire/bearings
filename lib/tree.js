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
    Tree.setChildNodes(nextNode, selected.childNodes);
    Tree.setChildNodes(selected, []);
    if (start.length > 0) {
        delete selected.selected;
        delete selected.caretLoc;
        nextNode.selected = true;
        selected = nextNode;
    }
    selected.caretLoc = 0;
};

Tree.clone = function(tree) {
    var ret = {title: tree.title, parent: tree.parent, childNodes: tree.childNodes.map(Tree.clone)};
    if (tree.caretLoc !== undefined) {
        ret.caretLoc = tree.caretLoc;
    }
    if (tree.selected !== undefined) {
        ret.selected = tree.selected;
    }
    return ret;
};

Tree.indent = function(tree) {
    // TODO what if there's no parent?
    var selected = Tree.findSelected(tree);
    var childNum = Tree.findChildNum(selected);
    if (childNum == 0) {
        return;
    }
    var newParent = selected.parent.childNodes[childNum - 1];
    newParent.childNodes.push(selected);
    selected.parent.childNodes.splice(childNum, 1);
    selected.parent = newParent;
};

Tree.unindent = function(tree) {
    var selected = Tree.findSelected(tree);
    if (!selected.parent.parent) {
        return;
    }
    var childNum = Tree.findChildNum(selected);
    var parentChildNum = Tree.findChildNum(selected.parent);
    var newParent = selected.parent.parent;
    newParent.childNodes.splice(parentChildNum + 1, 0, selected);
    selected.parent.childNodes.splice(childNum, 1);
    selected.parent = newParent;
};

Tree.setCurrentTitle = function(tree, title) {
    var selected = Tree.findSelected(tree);
    console.log('setting title from', selected.title, 'to', title);
    selected.title = title;
};

Tree.shiftUp = function(tree) {
    var selected = Tree.findSelected(tree);
    var childNum = Tree.findChildNum(selected);
    var parent = selected.parent;
    if (childNum == 0) {
        return;
    }
    if (parent.childNodes.length <= 1) {
        return;
    }
    var tmp = parent.childNodes[childNum];
    parent.childNodes[childNum] = parent.childNodes[childNum - 1]
    parent.childNodes[childNum - 1] = tmp;
};

Tree.shiftDown = function(tree) {
    var selected = Tree.findSelected(tree);
    var childNum = Tree.findChildNum(selected);
    var parent = selected.parent;
    if (childNum == parent.childNodes.length - 1) {
        return;
    }
    if (parent.childNodes.length <= 1) {
        return;
    }
    var tmp = parent.childNodes[childNum];
    parent.childNodes[childNum] = parent.childNodes[childNum + 1]
    parent.childNodes[childNum + 1] = tmp;
};

Tree.findChildNum = function(tree) {
    console.assert(tree.parent); // TODO not always true..
    var i;
    for (i = 0; i < tree.parent.childNodes.length; i++) {
        if (tree.parent.childNodes[i] == tree) {
            return i;
        }
    }
    console.assert(false);
}

Tree.backspaceAtBeginning = function(tree) {
    var selected = Tree.findSelected(tree);
    console.assert(selected.caretLoc === 0);
    var i;
    var previous = Tree.findPreviousNode(selected);
    var deleted = selected;
    for (i = 0; i < selected.parent.childNodes.length; i++) {
        if (selected.parent.childNodes[i] == selected) {
            console.log('fouuuud');
            break;
        }
    }
    selected.parent.childNodes.splice(i, 1);
    previous.selected = true;
    previous.caretLoc = previous.title.length;
    previous.title += deleted.title;
    Tree.setChildNodes(previous, deleted.childNodes);
}

Tree.setChildNodes = function(tree, childNodes) {
    // TODO is there a way to stop anyone from explicitly setting childNodes?
    // We want that because if anyone ever sets childNodes, they should also set the parent
    // of the children
    // Or is there a way to have implicit parents?
    tree.childNodes = childNodes;
    for (i = 0; i < childNodes.length; i++) {
        childNodes[i].parent = tree;
    }
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
