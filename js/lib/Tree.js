var Tree = {};
module.exports = exports = Tree;

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
        delete selected.selected;
        previous.selected = true;
    }
};

// TODO shouldn't this be the last node of the current zoom?
Tree.selectLastNode = function(tree) {
    var root = Tree.getRoot(tree);
    var last = Tree.findDeepest(root.zoom.childNodes[root.zoom.childNodes.length - 1]);
    var selected = Tree.findSelected(tree);
    delete selected.selected;
    last.selected = true;
    last.caretLoc = last.title.length;
};

Tree.selectFirstNode = function(tree) {
    var root = Tree.getRoot(tree);
    var selected = Tree.findSelected(tree);
    delete selected.selected;
    root.zoom.selected = true;
    root.zoom.caretLoc = 0;
};

Tree.appendSibling = function(tree, title) {
    var i;
    for (i = 0; i < tree.parent.childNodes.length; i++) {
        if (tree.parent.childNodes[i] == tree) {
            break;
        }
    }
    var ret = Tree.makeNode({title: title, parent: tree.parent});
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

Tree.setIfReal = function(toObj, fromObj, property, defaultVal) {
    if (fromObj[property] === undefined) {
        if (defaultVal !== undefined) {
            toObj[property] = defaultVal;
        }
        return;
    }
    toObj[property] = fromObj[property];
};

Tree.makeNode = function(args) {
    var ret = {};
    Tree.setIfReal(ret, args, 'title');
    Tree.setIfReal(ret, args, 'childNodes', []);
    Tree.setIfReal(ret, args, 'parent');
    Tree.setIfReal(ret, args, 'caretLoc');
    Tree.setIfReal(ret, args, 'selected');
    Tree.setIfReal(ret, args, 'collapsed');
    Tree.setIfReal(ret, args, 'zoom');
    return ret;
};

Tree.clone = function(tree) {
    return Tree.cloneGeneral(tree, null, {noparent: false, nomouse: false});
};

Tree.cloneNoParent = function(tree) {
    return Tree.cloneGeneral(tree, null, {noparent: true, nomouse: false});
};

Tree.cloneNoParentNoCursor = function(tree) {
    return Tree.cloneGeneral(tree, null, {noparent: true, nomouse: true});
};

Tree.cloneNoParentClean = function(tree) {
    return Tree.cloneGeneral(tree, null, {noparent: true, nomouse: false, clean: true});
};

Tree.cloneGeneral = function(tree, parent, options) {
    var me = Tree.makeNode({
            title: tree.title,
            parent: !!options.noparent ? undefined : parent,
            caretLoc: (!!options.nomouse || !!options.clean) ? undefined : tree.caretLoc,
            selected: !!options.nomouse ? undefined : tree.selected,
            collapsed: tree.collapsed});
    if (tree.childNodes.length > 0 || !options.clean) {
        me.childNodes = tree.childNodes.map(function (t) {return Tree.cloneGeneral(t, me, options)});
    } else {
        me.childNodes = undefined;
    }
    if (!options.noparent) {
        if (tree.zoom) { // TODO should be an invariant
            me.zoom = Tree.findFromIndexer(me, Tree.getPath(tree.zoom));
        }
    }
    me.zoomPath = tree.zoomPath;
    return me;
};

Tree.saveAndClone = function(tree) {
    var newTree = Tree.clone(tree);
}

Tree.indent = function(tree) {
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
    var root = Tree.getRoot(tree);
    if (!selected.parent.parent) {
        return;
    }
    if (selected === root.zoom || selected.parent === root.zoom) {
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
    var i;
    for (i = 0; i < tree.parent.childNodes.length; i++) {
        if (tree.parent.childNodes[i] == tree) {
            return i;
        }
    }
    console.assert(false);
}


Tree.getPath = function(tree) {
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

Tree.getRoot = function(tree) {
    if (tree.title === 'special_root_title') {
        return tree;
    }
    return Tree.getRoot(tree.parent);
};

// TODO actually implement..
Tree.getBreadcrumb = function(tree) {
    if (tree.title === 'special_root_title' || tree.parent.title === 'special_root_title') {
        return [];
    }
    ret.append(Tree.getBreadcrumb(tree.parent));
    ret.append(tree.parent);
    return ret;
}

Tree.zoom = function(tree) {
    if (!tree) {
        console.log('cannot zoom that high!');
        return;
    }
    var root = Tree.getRoot(tree);
    root.zoom = tree;
    root.zoomPath = Tree.getPath(tree);
};

Tree.zoomOutOne = function(tree) {
    var root = Tree.getRoot(tree);
    if (root.zoom) { // TODO this should be an invariant.. should always have root
        Tree.zoom(root.zoom.parent);
    }
};

Tree.deleteSelected = function(tree) {
    // TODO think if this is the root..
    var selected = Tree.findSelected(tree);
    var nextSelection = Tree.findPreviousNode(selected);
    if (!nextSelection) {
        console.assert(selected.parent.title === 'special_root_title');
        if (selected.parent.childNodes.length > 1) {
            nextSelection = selected.parent.childNodes[1];
        } else {
            selected.title = '';
            selected.childNodes = [];
            selected.selected = true;
            selected.caretLoc = 0;
            return;
        }
    }
    var childNum = Tree.findChildNum(selected);
    selected.parent.childNodes.splice(childNum, 1);
    nextSelection.selected = true;
    nextSelection.caretLoc = 0;
};

Tree.backspaceAtBeginning = function(tree) {
    // TODO think if this is the root
    var selected = Tree.findSelected(tree);
    console.assert(selected.caretLoc === 0);
    var previous = Tree.findPreviousNode(selected);
    if (!previous || previous === selected.parent) {
        return;
    }
    var childNum = Tree.findChildNum(selected);
    selected.parent.childNodes.splice(childNum, 1);
    previous.selected = true;
    previous.caretLoc = previous.title.length;
    previous.title += selected.title;
    Tree.setChildNodes(previous, selected.childNodes);
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
    if (tree.childNodes && tree.childNodes.length > 0 && !tree.collapsed) {
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
    if (tree.childNodes && tree.childNodes.length > 0 && !tree.collapsed) {
        return tree.childNodes[0];
    }
    var root = Tree.getRoot(tree);
    return Tree.findNextNodeRec(tree, root.zoom);
};

Tree.collapseCurrent = function(tree) {
    var selected = Tree.findSelected(tree);
    if (selected.childNodes && selected.childNodes.length > 0) {
        selected.collapsed = !selected.collapsed;
    }
};

Tree.findPreviousNode = function(tree) {
    if (!tree || !tree.parent) {
        return null;
    }
    var root = Tree.getRoot(tree);
    if (root.zoom === tree) {
        return;
    }
    var childNum = Tree.findChildNum(tree);
    if (childNum - 1 >= 0) {
        return Tree.findDeepest(tree.parent.childNodes[childNum - 1]);
    }
    if (tree.parent.title === 'special_root_title') {
        return null;
    }
    return tree.parent;
};

Tree.findNextNodeRec = function(tree, zoom) {
    if (!tree || !tree.parent) {
        return null;
    }
    if (tree === zoom) {
        return null;
    }
    var i = 0;
    var childNum = Tree.findChildNum(tree);
    if (childNum + 1 < tree.parent.childNodes.length) {
        return tree.parent.childNodes[childNum + 1];
    }
    return Tree.findNextNodeRec(tree.parent, zoom);
};

Tree.makeTree = function(nodes) {
    var ret = {title: 'special_root_title', parent: null};
    ret.childNodes = nodes.map(function (node) {
        return Tree.makeSubTree(node, ret);
    });
    ret.zoom = ret;
    ret.zoomPath = Tree.getPath(ret);
    return ret;
};

Tree.makeSubTree = function(node, parent) {
    var me = Tree.makeNode({
            title: node.title,
            parent: parent,
            selected: node.selected,
            caretLoc: node.caretLoc});
    if (node.childNodes) {
        me.childNodes = node.childNodes.map(function (node) {
            return Tree.makeSubTree(node, me);
        });
    }
    return me;
};

Tree.findFromIndexer = function(tree, indexer) {
    if (indexer.length <= 1) {
        return tree;
    }
    var parts = indexer.substr(1).split('-');
    for (var i = 0; i < parts.length; i++) {
        tree = tree.childNodes[parts[i]];
    }
    return tree;
}

Tree.toString = function(tree) {
    tree = Tree.cloneNoParent(tree);
    return JSON.stringify(tree);
};

Tree.toStringClean = function(tree) {
    tree = Tree.cloneNoParentClean(tree);
    return JSON.stringify(tree);
};

Tree.fromString = function(s) {
    var obj = JSON.parse(s);
    var ret = Tree.makeSubTree(obj, null);
    // TODO there should always be a zoomPath
    ret.zoomPath = obj.zoomPath;
    if (!ret.zoomPath) {
        ret.zoom = ret;
    } else {
        ret.zoom = Tree.findFromIndexer(ret, ret.zoomPath);
    }
    return ret;
};

Tree.equals = function(one, two) {
    return Tree.toString(one) === Tree.toString(two);
};
