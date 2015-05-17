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
    Tree.addUUIDPointer(ret);
    tree.parent.childNodes.splice(i + 1, 0, ret);
    return ret;
};

Tree.newChildAtCursor = function(selected) {
    var ret = Tree.makeNode({title: '', parent: selected});
    Tree.addUUIDPointer(ret);
    if (selected.childNodes) {
        selected.childNodes.unshift(ret);
    } else {
        selected.childNodes = [ret];
    }
    delete selected.selected;
    delete selected.caretLoc;
    ret.selected = true;
    ret.caretLoc = 0;
};

Tree.newLineAtCursor = function(tree) {
    var selected = Tree.findSelected(tree);
    var root = Tree.getRoot(tree);
    var textStart = selected.title.substr(0, selected.caretLoc);
    var textRest = selected.title.substr(selected.caretLoc);
    if (selected === root.zoom ||
              (textRest.length === 0 && selected.childNodes.length > 0 && !selected.collapsed)) {
        Tree.newChildAtCursor(selected);
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
            delete selected.selected;
            delete selected.caretLoc;
            nextNode.selected = true;
            selected = nextNode;
        }
        selected.caretLoc = 0;
    }
};

Tree.addUUIDPointer = function(tree) {
    var root = Tree.getRoot(tree);
    console.log('roooot', root);
    root.uuidMap[tree.uuid] = tree;
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
    Tree.setIfReal(ret, args, 'caretLoc');
    Tree.setIfReal(ret, args, 'selected');
    Tree.setIfReal(ret, args, 'collapsed');
    Tree.setIfReal(ret, args, 'completed');
    Tree.setIfReal(ret, args, 'completedHidden');
    if (!(options && options.clean)) {
        Tree.setIfReal(ret, args, 'uuidMap');
        Tree.setIfReal(ret, args, 'uuid', Tree.generateUUID());
    }
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

Tree.killPointers = function(obj) {
    var ret = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
          ret[key] = 0;
      }
    }
    return ret;
};

Tree.cloneGeneral = function(tree, parent, options) {
    var me = Tree.makeNode({
            title: tree.title,
            parent: !!options.noparent ? undefined : parent,
            caretLoc: (!!options.nomouse || !!options.clean) ? undefined : tree.caretLoc,
            selected: !!options.nomouse ? undefined : tree.selected,
            collapsed: tree.collapsed,
            completed: tree.completed,
            uuidMap: tree.uuidMap  && !options.clean ? Tree.killPointers(tree.uuidMap) : undefined,
            uuid: !!options.clean ? undefined : tree.uuid,
            completedHidden: tree.completedHidden}, {clean: options.clean});
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
    if (!options.noparent) {
        Tree.addUUIDPointer(me);
    }
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
    root.zoomPath = Tree.getPath(tree);
};

Tree.zoomOutOne = function(tree) {
    var root = Tree.getRoot(tree);
    if (root.zoom) { 
        if (root.zoom.parent) {
            var selected = Tree.findSelected(tree);
            delete selected.selected;
            root.zoom.selected = true;
            root.zoom.caretLoc = 0;
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
    if (!nextSelection) {
        console.assert(selected.parent.title === 'special_root_title');
        if (selected.parent.childNodes.length > 1) {
            nextSelection = selected.parent.childNodes[1];
        } else {
            selected.title = '';
            selected.childNodes = [];
            selected.selected = true;
            selected.caretLoc = 0;
            delete selected.collapsed;
            delete selected.completed;
            return;
        }
    }
    var childNum = Tree.findChildNum(selected);
    selected.parent.childNodes.splice(childNum, 1);
    nextSelection.selected = true;
    nextSelection.caretLoc = nextSelection.title.length;
};

Tree.backspaceAtBeginning = function(tree) {
    // TODO think if this is the root
    var selected = Tree.findSelected(tree);
    if (selected.caretLoc !== 0) {
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
        previous.selected = true;
        previous.caretLoc = previous.title.length;
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
            console.log('search over', i, tree.childNodes[i]);
            if (!completedHidden || !tree.childNodes[i].completed) {
                return Tree.findDeepest(tree.childNodes[i]);
            }

        }
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
            console.log('noooop');
            console.log(selected.parent.childNodes);
            return; // Can't select the only element left on the page..
        } else if (Tree.findChildNum(selected) === 0) {
            console.log('yeah, complete', selected);
            selected.completed = true;
            var backup = Tree.isCompletedHidden(tree);
            Tree.setCompletedHidden(tree, true);
            var next = Tree.findNextNode(selected.parent);
            Tree.setCompletedHidden(tree, backup);
            delete selected.selected;
            next.selected = true;
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
    var ret = {title: 'special_root_title', parent: null};
    ret.uuid = Tree.generateUUID();
    ret.uuidMap = {};
    ret.uuidMap[ret.uuid] = ret;
    ret.childNodes = nodes.map(function (node) {
        return Tree.makeSubTree(node, ret);
    });
    ret.zoom = ret;
    ret.zoomPath = Tree.getPath(ret);
    ret.completedHidden = true;
    return ret;
};

Tree.makeDefaultTree = function() {
    var rawStartTree =
        [{title: "goody", selected: "true", caretLoc: 0,
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

Tree.makeSubTree = function(node, parent) {
    var me = Tree.makeNode({
            title: node.title,
            parent: parent,
            selected: node.selected,
            collapsed: node.collapsed,
            completed: node.completed,
            completedHidden: node.completedHidden,
            uuid: node.uuid,
            caretLoc: node.caretLoc});
    if (parent) {
        Tree.addUUIDPointer(me);
    } else {
        me.uuidMap = {};
        me.uuidMap[me.uuid] = me;
    }
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
    var root = Tree.getRoot(ret);
    root.childNodes[0].selected = true;
    return Tree.makeTree(ret.childNodes);
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
