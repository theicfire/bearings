var React = require('react/addons');
Tree = require('./lib/Tree'); // TODO put var in front
var FastRenderTree = require('./lib/FastRenderTree');
var $ = require('jquery');
var Cursor = require('./lib/Cursor');
var _ = require('underscore');
var UndoRing = require('./lib/UndoRing');
var opml = require('opml-generator');

fastRenderOn = false; // TODO remove
var ReactTree = {};
globalTree = {}; // TODO put "var" back
var globalTreeBak; // For search
var globalOldTree; // For Undo/Redo
var globalOldTree2; // For fastRender
var globalParseTree;
var globalUndoRing;
var globalDataSaved = true;
var globalSkipFocus = false; // TODO remove?
var globalCompletedHidden;

var DataSaved = React.createClass({
    render: function() {
        var text = globalDataSaved ? "Saved" : "Unsaved";
        return (<span className='saved-text'>{text}</span>);
    }
});

var Breadcrumb = React.createClass({
    render: function() {
        var text = this.breadcrumbToText(Tree.getBreadcrumb(this.props.node));
        if (text.length > 0) {
            return (<div><span className='breadcrumb'>{this.breadcrumbToText(Tree.getBreadcrumb(this.props.node))}</span><hr/></div>);
        } else {
            return <div></div>;
        }
    },
    breadcrumbToText: function(titles) {
        if (titles.length > 0) {
            return titles.join(' > ') + ' >';
        }
        return '';
    }
});

var CompleteHiddenButton = React.createClass({
    render: function() {
        console.log('go and render', globalCompletedHidden);
        var text = globalCompletedHidden ? 'Show completed' : 'Hide completed';
        return (<a href="#" className='completed-hidden-button' onClick={this.handleClick}>{text}</a>);
    },
    handleClick: function(e) {
        globalCompletedHidden = !globalCompletedHidden;
        Tree.setCompletedHidden(globalTree, globalCompletedHidden);
        renderAll();
        e.preventDefault();
    }
});

var ResetButton = React.createClass({
    render: function() {
        return (<a href="#" onClick={this.handleClick}>Reset</a>);
    },
    handleClick: function(e) {
        console.log('reset');
        globalTree = Tree.makeDefaultTree();
        renderAll();
        e.preventDefault();
    }
});

var SearchBox = React.createClass({
 getInitialState: function() {
    return {value: ''};
  },
  handleChange: function(event) {
    this.setState({value: event.target.value});
    if (event.target.value.length === 0) {
        globalTree = globalTreeBak;
        globalTreeBak = null;
        renderAllNoUndo();
        return;
    }
    if (!globalTreeBak) {
        globalTreeBak = globalTree;
        globalTree = Tree.search(globalTree, event.target.value);
    } else {
        globalTree = Tree.search(globalTreeBak, event.target.value);
    }
    renderAllNoUndo();
  },
  handleFocus: function() {
    globalTree.selected = null;
  },
  render: function() {
    return <input type="text" className='search' placeholder='Search' value={this.state.value} onChange={this.handleChange} onFocus={this.handleFocus} />;
  }
});

ReactTree.TreeChildren = React.createClass({
render: function() {
    var childNodes;
    if (this.props.childNodes != null) {
        var that = this;
        childNodes = this.props.childNodes.map(function(node, index) {
            return <li key={index}><ReactTree.TreeNodeWrapper node={node} /></li>
        });
    }

    return (
        <ul style={this.props.style}>
        {childNodes}
        </ul>
    );

}
});

ReactTree.TreeNodeWrapper = React.createClass({
render: function() {
    return (
        <div className='node-wrapper' id={this.props.node.uuid}>
          <ReactTree.TreeNode node={this.props.node} topBullet={this.props.topBullet} />
        </div>
    );
},
});

ReactTree.TreeNode = React.createClass({
getInitialState: function() {
    return {
      mouseOver: false
    };
},

handleChange: function(event) {
    var html = this.refs.input.getDOMNode().textContent;
    if (html !== this.lastHtml) {
        var currentNode = Tree.findFromUUID(globalTree, this.props.node.uuid);
        currentNode.title = event.target.textContent;
        globalTree.caretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
        renderAll();
    } else {
        console.assert(false, 'Why am I getting a change event if nothing changed?');
    }
    this.lastHtml = html;
},

handleClick: function(event) {
    if (globalSkipFocus) {
        return;
    }
    var currentNode = Tree.findFromUUID(globalTree, this.props.node.uuid);
    globalTree.selected = currentNode.uuid;
    if (event.type === 'focus') {
        globalTree.caretLoc = currentNode.title.length;
    } else {
        globalTree.caretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
    }
},

componentDidMount: function() {
    if (this.props.node.uuid === globalTree.selected) {
        var el = $(this.refs.input.getDOMNode());
        globalSkipFocus = true;
        el.focus();
        globalSkipFocus = false;
        Cursor.setCursorLoc(el[0], globalTree.caretLoc);
    }
},

handleKeyDown: function(e) {
    var KEYS = {LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        ENTER: 13,
        TAB: 9,
        BACKSPACE: 8,
        Z: 90,
        Y: 89,
        S: 83,
        C: 67,
        END: 35,
        HOME: 36,
        SPACE: 32};
    if (e.keyCode === KEYS.LEFT) {
        if (e.ctrlKey) {
            Tree.zoomOutOne(globalTree);
            renderAll();
            e.preventDefault();
        } else {
            var newCaretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
            if (newCaretLoc === 0) {
                Tree.selectPreviousNode(globalTree);
                var selected = Tree.findSelected(globalTree); // TODO could do this faster than two searches
                globalTree.caretLoc = selected.title.length;
                renderAll();
                e.preventDefault();
            } else {
                globalTree.caretLoc = newCaretLoc - 1;
            }
        }
    } else if (e.keyCode === KEYS.END && e.ctrlKey) {
        Tree.selectLastNode(globalTree);
        renderAll();
        e.preventDefault();
    } else if (e.keyCode === KEYS.HOME && e.ctrlKey) {
        Tree.selectFirstNode(globalTree);
        renderAll();
        e.preventDefault();
    } else if (e.keyCode === KEYS.UP) {
        if (e.shiftKey && e.ctrlKey) {
            Tree.shiftUp(globalTree);
        } else {
            Tree.selectPreviousNode(globalTree);
            globalTree.caretLoc = 0;
        }
        renderAll();
        e.preventDefault();
    } else if (e.keyCode === KEYS.RIGHT) {
        if (e.ctrlKey) {
            var currentNode = Tree.findFromUUID(globalTree, this.props.node.uuid);
            Tree.zoom(currentNode);
            renderAll();
            e.preventDefault();
        } else {
            var newCaretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
            if (newCaretLoc === this.refs.input.getDOMNode().textContent.length) {
                Tree.selectNextNode(globalTree);
                globalTree.caretLoc = 0;
                renderAll();
                e.preventDefault();
            } else {
                globalTree.caretLoc = newCaretLoc + 1;
            }
        }
    } else if (e.keyCode === KEYS.DOWN) {
        if (e.shiftKey && e.ctrlKey) {
            Tree.shiftDown(globalTree);
        } else {
            console.log('down');
            Tree.selectNextNode(globalTree);
            globalTree.caretLoc = 0;
        }
        renderAll();
        e.preventDefault();
    } else if (e.keyCode === KEYS.ENTER && e.ctrlKey) {
        console.log('complete current');
        Tree.completeCurrent(globalTree);
        renderAll();
        e.preventDefault();
    } else if (e.keyCode === KEYS.ENTER) {
        var caretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
        globalTree.caretLoc = caretLoc;
        console.log('loc', caretLoc);
        Tree.newLineAtCursor(globalTree);
        renderAll();
        e.preventDefault();
    } else if (e.keyCode === KEYS.BACKSPACE) {
        if (e.ctrlKey && e.shiftKey) {
            Tree.deleteSelected(globalTree);
            renderAll();
            e.preventDefault();
        } else {
            globalTree.caretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
            if (globalTree.caretLoc === 0) {
                Tree.backspaceAtBeginning(globalTree);
                renderAll();
                e.preventDefault();
            }
        }
    } else if (e.keyCode === KEYS.TAB) {
        if (e.shiftKey) {
            Tree.unindent(globalTree);
        } else {
            Tree.indent(globalTree);
        }
        renderAll();
        e.preventDefault();

    } else if (e.keyCode === KEYS.SPACE && e.ctrlKey) {
        Tree.collapseCurrent(globalTree);
        renderAll();
        e.preventDefault();
    } else if (e.keyCode === KEYS.Z && (e.ctrlKey || e.metaKey)) {
        globalTree = Tree.clone(globalUndoRing.undo());
        renderAllNoUndo();
        e.preventDefault();
    } else if (e.keyCode === KEYS.Y && (e.ctrlKey || e.metaKey)) {
        globalTree = Tree.clone(globalUndoRing.redo());
        renderAllNoUndo();
        e.preventDefault();
    } else if (e.keyCode === KEYS.S && e.ctrlKey) {
        console.log('ctrl s');
        console.log(JSON.stringify(Tree.cloneNoParentClean(globalTree), null, 4));
        window.prompt("Copy to clipboard: Ctrl+C, Enter", JSON.stringify(Tree.cloneNoParentClean(globalTree), null, 4));
        e.preventDefault();
    } else if (e.keyCode === KEYS.C && e.ctrlKey) {
        var currentNode = Tree.findFromUUID(globalTree, this.props.node.uuid);
        var outlines = Tree.toOutline(currentNode);
        console.log(opml({}, [outlines]));
        e.preventDefault();
    } else {
        console.log(e.keyCode);
    }
},

componentDidUpdate: function(prevProps, prevState) {
    console.log('updated', this.props.node.title);
    if (this.props.node.uuid === globalTree.selected) {
        var el = $(this.refs.input.getDOMNode());
        globalSkipFocus = true;
        //console.log('focus on', this.props.node.title);
        el.focus();
        globalSkipFocus = false;
        Cursor.setCursorLoc(el[0], globalTree.caretLoc);
    }
    if ( this.refs.input && this.props.node.title !== this.refs.input.getDOMNode().textContent ) {
        // Need this because of: http://stackoverflow.com/questions/22677931/react-js-onchange-event-for-contenteditable/27255103#27255103
        // An example he was mentioning is that the virtual dom thinks that the div is empty, but if
        // you type something and then press "clear", or specifically set the text, the VDOM will
        // think the two are the same.
        // I believe this will never happen for me though? Because I don't overtly set text.. text is only set when someone is typing, right?
        //this.refs.input.getDOMNode().textContent = this.props.node.title;
        console.assert(false, 'Did not expect this to get hit. My thoughts are wrong. Check out the comments.');
    }
},

// TODO good for speedups..
//shouldComponentUpdate: function(nextProps, nextState) {
    //return !_.isEqual(this.props, nextProps);
//},
// TODO something about cursor jumps need this?
// See: http://stackoverflow.com/questions/22677931/react-js-onchange-event-for-contenteditable/27255103#27255103
// I think what "cursor jump" means is that if we set the textContent for some reason, but we are
// actually just setting it to be the exact same html, then the cursor will jump to the front/end.
//shouldComponentUpdate: function(nextProps){
        //return nextProps.html !== this.getDOMNode().textContent;
    //},

render: function() {
    var className = "dot";
    if (this.props.node.childNodes != null) {
        className = "dot togglable";
        if (this.props.node.collapsed) {
            className += " dot-collapsed";
        }
    }

    var contentClassName = "editable";
    if (this.props.topBullet) {
        contentClassName = "editable topBullet";
    }
    if (this.props.node.title == 'special_root_title') {
        contentClassName += ' display-none';
    }

    if (this.props.node.completed) {
        contentClassName += " completed";
    }

    var plus;
    if (this.state.mouseOver) {
        if (this.props.node.childNodes != null && this.props.node.collapsed) {
            plus = (<div onClick={this.toggle} className='collapseButton'>+</div>);
        } else {
            plus = (<div onClick={this.toggle} className='collapseButton'>-</div>);
        }
    }
    var bulletPoint = '';
    if (!this.props.topBullet) {
        bulletPoint = (<span onClick={this.zoom} onMouseOver={this.mouseOver} className={className}>{String.fromCharCode(8226)}</span>);
    }

    var children = '';
    if (this.props.topBullet || !this.props.node.collapsed) {
        children = (<ReactTree.TreeChildren childNodes={this.props.node.childNodes} />);
    }

    if (this.props.node.completed && globalCompletedHidden && !this.props.topBullet) {
        return false;
    }

    var textBox = (
        <div className={contentClassName} contentEditable
            ref="input"
            onKeyDown={this.handleKeyDown}
            onInput={this.handleChange}
            onFocus={this.handleClick}
            onClick={this.handleClick}
            dangerouslySetInnerHTML={{__html: _.escape(this.props.node.title)}}>
            </div>);
    if (globalTreeBak) {
        textBox = (
            <div className={contentClassName} 
                ref="input"
                onKeyDown={this.handleKeyDown}
                onInput={this.handleChange}
                onFocus={this.handleClick}
                onClick={this.handleClick}
                dangerouslySetInnerHTML={{__html: _.escape(this.props.node.title)}}>
                </div>);
    }
    return (
        <div>
        <div className="node-direct-wrapper">
        {bulletPoint}<div className='plus-wrapper'>{plus}</div>
        {textBox}
        </div>
        {children}
        </div>
    );
},

toggle: function() {
    var currentNode = Tree.findFromUUID(globalTree, this.props.node.uuid);
    globalTree.selected = currentNode.uuid;
    Tree.collapseCurrent(globalTree);
    renderAll();
},
mouseOver: function() {
    this.setState({mouseOver: true});
},
mouseOut: function() {
    this.setState({mouseOver: false});
},
zoom: function() {
    var node = Tree.findFromUUID(globalTree, this.props.node.uuid);
    Tree.zoom(node);
    globalTree.selected = node.uuid;
    renderAll();
}
});

ReactTree.startRender = function(parseTree) {
    globalTree = Tree.fromString(parseTree.get('tree'));
    console.log(globalTree);
    console.log('hidden is', Tree.isCompletedHidden(globalTree));
    globalCompletedHidden = Tree.isCompletedHidden(globalTree);
    globalParseTree = parseTree;
    var newTree = Tree.clone(globalTree);
    globalUndoRing = new UndoRing(newTree, 50);
    renderAll();

    //setInterval(function () {
        //if (!globalDataSaved) {
            //globalParseTree.set('tree', Tree.toString(globalTree));
            //globalParseTree.save();
            //globalDataSaved = true;
            //renderAllNoUndo();
        //}
        //globalUndoRing.commit();
    //}, 2000);
}


function renderAll() {
    // TODO speedup by removing clone. I might not need to clone. What this does is allow us to
    // use shouldComponentUpdate. If we have two versions of the tree, then we can compare if one
    // changed relative to the other, and we don't have to call render. But, we have to clone, which
    // may be slow.
    if (fastRenderOn) {
      fastRender();
      return;
    }
    console.log('renderall');
    fastRenderOn = true;
    var newTree = Tree.clone(globalTree);
    globalOldTree2 = newTree;
    if (!_.isEqual(globalOldTree, Tree.cloneNoParentNoCursor(globalTree))) {
        globalDataSaved = false;
        globalUndoRing.addPending(newTree);
        globalOldTree = Tree.cloneNoParentNoCursor(globalTree);
    }
    doRender(newTree);
};

function fastRender() {
    var diff = FastRenderTree.diff(globalOldTree2, globalTree);
    var operations = FastRenderTree.operations(globalOldTree2, globalTree, diff);
    console.log('do operations', operations);
    var newTree = Tree.clone(globalTree);
    applyOperations(globalOldTree2, globalTree, operations);
    globalOldTree2 = newTree;
}

function renderAllNoUndo() {
    console.assert(false);
    var newTree = Tree.clone(globalTree);
    doRender(newTree);
}

ReactTree.tree_to_html = function(tree) {
  var ret = $('<div></div>');
  ret.attr('class', 'node-wrapper');
  ret.attr('id', tree.uuid);
  return ret;
};

function doRender(tree) {
    //console.log('rendering with', Tree.toString(tree));

    // TODO should always have a zoom?
    //<ReactTree.TreeChildren childNodes={tree.zoom.childNodes} />
    if (tree.zoom !== undefined) {
        React.render(
    <div id='base-react'>
    <div className='header'><span className='logo'>Bearings</span><SearchBox/><div className='header-buttons'><ResetButton/><a href="import.html">Import</a><DataSaved /><CompleteHiddenButton /></div> </div>
    <div className='pad-wrapper'>
        <div className='breadcrumbs-wrapper'><Breadcrumb node={tree} /></div>
        <ReactTree.TreeNodeWrapper topBullet={true} node={tree.zoom}/>
        </div>
    </div>,
          document.getElementById("tree")
        );
    } else {
        // TODO remove
        console.assert(false, 'I didn\'t think this would happen');
        //console.log('no zoom');
        //React.render(
          //<div>
      //<ResetButton/> | <a href="import.html">Import</a> | <DataSaved />
          //<div><Breadcrumb node={tree} /></div>
          //<ReactTree.TreeNodeWrapper node={tree}/>
          //</div>,
          //document.getElementById("tree")
        //);
    }
}

/*
 * Make the dom of a given uuid for some tree.
 */
function makeDom(tree, uuid) {
    var root = Tree.getRoot(tree);
    return ReactTree.tree_to_html(root.uuidMap[uuid]);
}
function applyOperations(oldTree, newTree, operations) {
    operations.forEach(function(operation) {
        if (operation.hasOwnProperty('del')) {
            console.log('deleting', $('#' + operation.del));
            $('#' + operation.del).remove();
        } else if (operation.hasOwnProperty('insertAfter')) {
            var newEl = makeDom(newTree, operation.newUUID);
            console.log('adding', newEl, 'after', $('#' + operation.insertAfter));
            newEl.insertAfter('#' + operation.insertAfter);
            newEl.find('div.editable').focus();
            React.render(<ReactTree.TreeNode node={newTree.uuidMap[operation.newUUID]}/>, newEl[0]);
        } else if (operation.hasOwnProperty('insertChild')) {
            var newEl = makeDom(newTree, operation.newUUID);
            console.log('prepend()', newEl, 'to', $('#' + operation.insertChild));
            newEl.prepend('#' + operation.insertChild);
            newEl.find('div.editable').focus();
            React.render(<ReactTree.TreeNode node={newTree.uuidMap[operation.newUUID]}/>, newEl[0]);
        }
    });
};

module.exports = ReactTree;

