var Tree = {};
module.exports = exports = Tree;

Tree.generateUUID = function(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

Tree.selectNextNode = function(tree) {
    var selected = Tree.findSelected(tree);
    var root = Tree.getRoot(tree);
    var next = Tree.findNextNode(selected);
    if (next) {
        root.selected = next.uuid;
    }
};

Tree.selectPreviousNode = function(tree) {
    var selected = Tree.findSelected(tree);
    var root = Tree.getRoot(tree);
    var previous = Tree.findPreviousNode(selected);
    if (previous) {
        root.selected = previous.uuid;
    }
};

// TODO shouldn't this be the last node of the current zoom?
Tree.selectLastNode = function(tree) {
    var root = Tree.getRoot(tree);
    var last = Tree.findDeepest(root.zoom.childNodes[root.zoom.childNodes.length - 1]);
    var selected = Tree.findSelected(tree);
    root.selected = last.uuid;
    root.caretLoc = last.title.length;
};

Tree.selectFirstNode = function(tree) {
    var root = Tree.getRoot(tree);
    root.selected = root.zoom.uuid;
    root.caretLoc = 0;
};

Tree.appendSibling = function(tree, title) {
    var i;
    for (i = 0; i < tree.parent.childNodes.length; i++) {
        if (tree.parent.childNodes[i] == tree) {
            break;
        }
    }
    var ret = Tree.makeNode({title: title, parent: tree.parent});
    Tree.addUUIDPointer(ret);
    tree.parent.childNodes.splice(i + 1, 0, ret);
    return ret;
};

Tree.newChildAtCursor = function(selected) {
    var ret = Tree.makeNode({title: '', parent: selected});
    var root = Tree.getRoot(selected);
    Tree.addUUIDPointer(ret);
    if (selected.childNodes) {
        selected.childNodes.unshift(ret);
    } else {
        selected.childNodes = [ret];
    }
    root.selected = ret.uuid;
    root.caretLoc = 0;
};

Tree.newLineAtCursor = function(tree) {
    var selected = Tree.findSelected(tree);
    var root = Tree.getRoot(tree);
    var textStart = selected.title.substr(0, root.caretLoc);
    var textRest = selected.title.substr(root.caretLoc);
    if (selected === root.zoom ||
              (textRest.length === 0 && selected.childNodes.length > 0 && !selected.collapsed)) {
        Tree.newChildAtCursor(selected, root);
    } else {
        selected.title = textStart;
        var nextNode = Tree.appendSibling(selected, textRest);
        if (textRest.length > 0) {
            Tree.setChildNodes(nextNode, selected.childNodes);
            Tree.setChildNodes(selected, []);
            if (selected.collapsed) {
                nextNode.collapsed = true;
                delete selected.collapsed;
            }
        }
        if (textStart.length > 0 || (textStart.length === 0 && textRest.length === 0)) {
            root.selected = nextNode.uuid;
        }
        root.caretLoc = 0;
    }
};

Tree.addUUIDPointer = function(tree) {
    var root = Tree.getRoot(tree);
    root.uuidMap[tree.uuid] = tree;
};

Tree.addUUIDPointers = function(tree) {
    Tree.addUUIDPointer(tree);
    tree.childNodes.map(function(child) {
        Tree.addUUIDPointers(child);
    });
};

Tree.findFromUUID = function(tree, uuid) {
    var root = Tree.getRoot(tree);
    return root.uuidMap[uuid];
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

Tree.makeNode = function(args, options) {
    var ret = {};
    Tree.setIfReal(ret, args, 'title');
    Tree.setIfReal(ret, args, 'childNodes', []);
    Tree.setIfReal(ret, args, 'parent');
    Tree.setIfReal(ret, args, 'selected');
    Tree.setIfReal(ret, args, 'collapsed');
    Tree.setIfReal(ret, args, 'completed');
    Tree.setIfReal(ret, args, 'completedHidden');
    Tree.setIfReal(ret, args, 'caretLoc');
    Tree.setIfReal(ret, args, 'uuid', Tree.generateUUID());
    Tree.setIfReal(ret, args, 'uuidMap');
    Tree.setIfReal(ret, args, 'zoom');
    return ret;
};

Tree.clone = function(tree) {
    var ret = Tree.cloneGeneral(tree, null, {noparent: false, nomouse: false});
    Tree.addUUIDPointers(ret);
    if (tree.zoom) { // TODO should be an invariant
        var root = Tree.getRoot(ret);
        ret.zoom = root.uuidMap[tree.zoomUUID];
    }
    return ret;
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
            selected: !!options.nomouse ? undefined : tree.selected,
            collapsed: tree.collapsed,
            completed: tree.completed,
            caretLoc: !!options.nomouse ? undefined : tree.caretLoc,
            uuid: tree.uuid,
            uuidMap: options.noparent ? undefined : {},
            completedHidden: tree.completedHidden}, {clean: options.clean});
    if (tree.childNodes && tree.childNodes.length > 0) {
        me.childNodes = tree.childNodes.map(function (node) {
            return Tree.cloneGeneral(node, me, options)
        });
    } else if (options.clean) {
        me.childNodes = undefined;
    }
    me.zoomUUID = tree.zoomUUID;
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
    delete newParent.collapsed;
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
};

Tree.getRoot = function(tree) {
    if (tree.title === 'special_root_title') {
        return tree;
    }
    return Tree.getRoot(tree.parent);
};

Tree.getBreadcrumb = function(root) {
    if (root.zoom.title === 'special_root_title') {
        return [];
    }
    var ret = Tree.getBreadcrumbInner(root.zoom.parent);
    ret.unshift('Home');
    return ret;
};

Tree.getBreadcrumbInner = function(tree) {
    if (tree.title === 'special_root_title') {
        return [];
    }
    var ret = Tree.getBreadcrumbInner(tree.parent);
    ret.push(tree.title);
    return ret;
}

Tree.zoom = function(tree) {
    if (!tree) {
        console.log('cannot zoom that high!');
        return;
    }
    var root = Tree.getRoot(tree);
    root.zoom = tree;
    root.zoomUUID = tree.uuid;
};

Tree.zoomOutOne = function(tree) {
    var root = Tree.getRoot(tree);
    if (root.zoom) { 
        if (root.zoom.parent) {
            var selected = Tree.findSelected(tree);
            root.selected = root.zoom.uuid;
            root.caretLoc = 0;
            Tree.zoom(root.zoom.parent);
        }
    } else {
        // TODO ever get hit?
        console.assert(false, "something wrong");
    }
};

Tree.deleteSelected = function(tree) {
    // TODO think if this is the root..
    var selected = Tree.findSelected(tree);
    var nextSelection = Tree.findPreviousNode(selected);
    var root = Tree.getRoot(tree);
    if (!nextSelection) {
        console.assert(selected.parent.title === 'special_root_title');
        if (selected.parent.childNodes.length > 1) {
            nextSelection = selected.parent.childNodes[1];
        } else {
            selected.title = '';
            selected.childNodes = [];
            root.caretLoc = 0;
            delete selected.collapsed;
            delete selected.completed; // TODO do I want this?
            return;
        }
    }
    var childNum = Tree.findChildNum(selected);
    selected.parent.childNodes.splice(childNum, 1);
    root.selected = nextSelection.uuid;
    root.caretLoc = nextSelection.title.length;
};

Tree.backspaceAtBeginning = function(tree) {
    // TODO think if this is the root
    var selected = Tree.findSelected(tree);
    var root = Tree.getRoot(tree);
    if (root.caretLoc !== 0) {
        console.log('TODO: home/end keys do not update caretLoc, and so this invariant fails');
    }
    var previous = Tree.findPreviousNode(selected);
    if (!previous || previous === selected.parent) {
        if (selected.title.length === 0) {
            Tree.deleteSelected(tree);
        }
        return;
    }
    // If the previous node is collapsed, it would be confusing to allow a "backspaceAtBeginning" to happen.
    if (!previous.collapsed) {
        var childNum = Tree.findChildNum(selected);
        selected.parent.childNodes.splice(childNum, 1);
        var root = Tree.getRoot(tree);
        root.selected = previous.uuid;
        root.caretLoc = previous.title.length;
        previous.title += selected.title;
        Tree.setChildNodes(previous, selected.childNodes);
        previous.collapsed = selected.collapsed;
    } else if (selected.title.length === 0) {
        Tree.deleteSelected(tree);
    }
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
    var completedHidden = Tree.isCompletedHidden(tree);
    if (tree.childNodes && !tree.collapsed) {
        for (var i = tree.childNodes.length - 1; i >= 0; i--) {
            if (!completedHidden || !tree.childNodes[i].completed) {
                return Tree.findDeepest(tree.childNodes[i]);
            }

        }
    }
    return tree;
};

Tree.findSelected = function(node) {
    var root = Tree.getRoot(node);
    console.assert(root === node);
    if (!root.selected) {
        return null;
    }
    return root.uuidMap[root.selected];
};


Tree.collapseCurrent = function(tree) {
    var selected = Tree.findSelected(tree);
    if (selected.childNodes && selected.childNodes.length > 0) {
        selected.collapsed = !selected.collapsed;
    }
};

Tree.countVisibleChildren = function(tree) {
    return tree.childNodes.filter(function (n) {
        return !n.completed;
    }).length;
};

Tree.completeCurrent = function(tree) {
    var selected = Tree.findSelected(tree);
    var root = Tree.getRoot(tree);
    if (root.zoom === selected) {
        return;
    }
    if (!selected.completed && selected.parent.title === 'special_root_title') {
        if (Tree.countVisibleChildren(selected.parent) <= 1) {
            return; // Can't select the only element left on the page..
        } else if (Tree.findChildNum(selected) === 0) {
            selected.completed = true;
            var backup = Tree.isCompletedHidden(tree);
            Tree.setCompletedHidden(tree, true);
            var next = Tree.findNextNode(selected.parent);
            Tree.setCompletedHidden(tree, backup);
            root.selected = next.uuid;
            return;
        }
    }
    selected.completed = !selected.completed;

    // Make sure to get off the current node. Particularly necessary if completion turns the node hidden.
    if (selected.completed) {
        var backup = Tree.isCompletedHidden(tree);
        Tree.selectPreviousNode(tree);
        Tree.setCompletedHidden(tree, true);
        Tree.selectNextNode(tree);
        Tree.setCompletedHidden(tree, backup);
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
    var completedHidden = Tree.isCompletedHidden(tree);
    for (var childNum = Tree.findChildNum(tree) - 1; childNum >= 0; childNum--) {
        if (!completedHidden || !tree.parent.childNodes[childNum].completed) {
            return Tree.findDeepest(tree.parent.childNodes[childNum]);
        }
    }

    if (tree.parent.title === 'special_root_title') {
        return null;
    }
    return tree.parent;
};

Tree.findNextNode = function(tree) {
    var root = Tree.getRoot(tree);
    var completedHidden = Tree.isCompletedHidden(tree);
    if (tree.childNodes && tree.childNodes.length > 0 && (!tree.collapsed || root.zoom === tree)) {
        for (var i = 0; i < tree.childNodes.length; i++) {
            if (!completedHidden || !tree.childNodes[i].completed) {
                return tree.childNodes[i];
            }
        }
    }
    return Tree.findNextNodeRec(tree, root.zoom);
};

Tree.findNextNodeRec = function(tree, zoom) {
    if (!tree || !tree.parent) {
        return null;
    }
    if (tree === zoom) {
        return null;
    }
    var childNum = Tree.findChildNum(tree);
    var completedHidden = Tree.isCompletedHidden(tree);
    for (var childNum = Tree.findChildNum(tree) + 1; childNum < tree.parent.childNodes.length; childNum++) {
        if (!completedHidden || !tree.parent.childNodes[childNum].completed) {
            return tree.parent.childNodes[childNum];
        }
    }
    return Tree.findNextNodeRec(tree.parent, zoom);
};

Tree.makeTree = function(nodes) {
    var ret = {title: 'special_root_title', parent: null, childNodes: nodes};
    ret = Tree.clone(ret);
    ret.zoom = ret;
    ret.zoomUUID = ret.uuid;
    ret.completedHidden = true;
    //ret.selected = ret.childNodes[0].uuid; // TODO check if needed?
    return ret;
};

Tree.makeDefaultTree = function() {
    var rawStartTree =
        [{title: "goody",
                childNodes: [
                    {title: "billy"},
                    {title: "suzie", childNodes: [
                            {title: "puppy", childNodes: [
                                    {title: "dog house"}
                                ]},
                            {title: "cherry thing"}
                        ]}
                ]}];
    rawStartTree.push({title: "the end"});
    var ret = Tree.makeTree(rawStartTree);
    return ret;
}

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

Tree.toStringPretty = function(tree) {
    tree = Tree.cloneNoParent(tree);
    return JSON.stringify(tree, null, 2);
};

Tree.toStringClean = function(tree) {
    tree = Tree.cloneNoParentClean(tree);
    return JSON.stringify(tree);
};

Tree.fromString = function(s) {
    var obj = JSON.parse(s);
    var ret = Tree.clone(obj);
    if (!ret.zoomUUID) {
        ret.zoom = ret;
    } else {
        ret.zoom = ret.uuidMap[ret.zoomUUID];
    }
    return ret;
};

Tree.equals = function(one, two) {
    return Tree.toString(one) === Tree.toString(two);
};

Tree.toOutline = function(tree) {
    var ret = {
        text: tree.title,
        _children: tree.childNodes.map(function (node) {
                return Tree.toOutline(node);
    })};

    return ret;
};

Tree.setCompletedHidden = function(tree, isHidden) {
    var root = Tree.getRoot(tree);
    // TODO or assert (tree == root)
    root.completedHidden = isHidden;
};

Tree.isCompletedHidden = function(tree) {
    var root = Tree.getRoot(tree);
    return root.completedHidden;
};

Tree.recSearch = function(tree, query) {
    var newTree = {title: tree.title, childNodes: []};
    for (var i = 0; i < tree.childNodes.length; i++) {
        if (Tree.recSearch(tree.childNodes[i], query)) {
            //console.log('push on', tree.childNodes[i].title);
            newTree.childNodes.push(Tree.recSearch(tree.childNodes[i], query));
        }
    }
    if (newTree.childNodes.length === 0) {
        if (tree.title.indexOf(query) > -1) {
            //console.log('yeahh', tree.title, query);
            return {title: tree.title, childNodes: []};
        }
        return null;
    }
    return newTree;
};

Tree.search = function(tree, query) {
    var ret = Tree.recSearch(tree, query);
    if (ret) {
        return Tree.makeTree(ret.childNodes);
    }
    return Tree.makeTree();
};

Tree.yamlObjToTree = function(obj) {
    var ret = [];
    for (var i = 0; i < obj.length; i++) {
        if (obj[i + 1] instanceof Array) {
            ret.push({title: obj[i], childNodes: Tree.yamlObjToTree(obj[i + 1])});
            i += 1;
        } else if (typeof(obj[i]) === 'object' && obj[i].hasOwnProperty('title')) {
            ret.push(obj[i]);
        } else {
            ret.push({title: obj[i]});
        }
    }
    return ret;
};
