var React = require('react/addons');
var Tree = require('./lib/Tree');
var $ = require('jquery');
var Cursor = require('./lib/Cursor');
var _ = require('underscore');
var UndoRing = require('./lib/UndoRing');
var opml = require('opml-generator');

var globalTree;
var globalTreeBak;
var globalOldTree;
var globalParseTree;
var globalUndoRing;
var globalDataSaved = true;
var globalSkipFocus = false; // TODO remove?
var globalCompletedHidden;
var globalLocalState = {};

var DataSaved = React.createClass({
    render: function() {
        var text = globalDataSaved ? "Saved" : "Unsaved";
        return (<span>{text}</span>);
    }
});

var Breadcrumb = React.createClass({
    render: function() {
        return (<span className='breadcrumb'>{this.breadcrumbToText(Tree.getBreadcrumb(this.props.node))}</span>);
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
        return (<a href="#" onClick={this.handleClick}>{text}</a>);
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
    console.log('cool', event.target.value);
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
    var value = this.state.value;
    console.log('value', value);
    return <input type="text" value={value} onChange={this.handleChange} onFocus={this.handleFocus} />;
  }
});

var TreeChildren = React.createClass({
render: function() {
    var childNodes;
    if (this.props.childNodes != null) {
        var that = this;
        childNodes = this.props.childNodes.map(function(node, index) {
            return <li key={index}><TreeNode node={node} /></li>
        });
    }

    return (
        <ul style={this.props.style}>
        {childNodes}
        </ul>
    );

}
});
var TreeNode = React.createClass({
getInitialState: function() {
    return {
      title: this.props.node.title
    };
},

handleChange: function(event) {
    var html = this.refs.input.getDOMNode().textContent;
    if (html !== this.lastHtml) {
        var currentNode = Tree.findFromUUID(globalTree, this.props.node.uuid);
        currentNode.title = event.target.textContent;
        globalLocalState.caretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
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
        globalLocalState.caretLoc = currentNode.title.length;
    } else {
        globalLocalState.caretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
    }
},

componentDidMount: function() {
    if (this.props.node.uuid === globalTree.selected) {
        var el = $(this.refs.input.getDOMNode());
        globalSkipFocus = true;
        el.focus();
        globalSkipFocus = false;
        Cursor.setCursorLoc(el[0], globalLocalState.caretLoc);
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
            Tree.zoomOutOne(globalTree, globalLocalState);
            renderAll();
            e.preventDefault();
        } else {
            var newCaretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
            if (newCaretLoc === 0) {
                Tree.selectPreviousNode(globalTree);
                var selected = Tree.findSelected(globalTree); // TODO could do this faster than two searches
                globalLocalState.caretLoc = selected.title.length;
                renderAll();
                e.preventDefault();
            } else {
                globalLocalState.caretLoc = newCaretLoc - 1;
            }
        }
    } else if (e.keyCode === KEYS.END && e.ctrlKey) {
        Tree.selectLastNode(globalTree, globalLocalState);
        renderAll();
        e.preventDefault();
    } else if (e.keyCode === KEYS.HOME && e.ctrlKey) {
        Tree.selectFirstNode(globalTree);
        renderAll();
        e.preventDefault();
    } else if (e.keyCode === KEYS.UP) {
        if (e.shiftKey && e.altKey) {
            Tree.shiftUp(globalTree);
        } else {
            Tree.selectPreviousNode(globalTree);
            globalLocalState.caretLoc = 0;
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
                globalLocalState.caretLoc = 0;
                renderAll();
                e.preventDefault();
            } else {
                globalLocalState.caretLoc = newCaretLoc + 1;
            }
        }
    } else if (e.keyCode === KEYS.DOWN) {
        if (e.shiftKey && e.altKey) {
            Tree.shiftDown(globalTree);
        } else {
            console.log('down');
            Tree.selectNextNode(globalTree);
            globalLocalState.caretLoc = 0;
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
        globalLocalState.caretLoc = caretLoc;
        console.log('loc', caretLoc);
        Tree.newLineAtCursor(globalTree, globalLocalState);
        renderAll();
        e.preventDefault();
    } else if (e.keyCode === KEYS.BACKSPACE) {
        if (e.ctrlKey && e.shiftKey) {
            Tree.deleteSelected(globalTree, globalLocalState);
            renderAll();
            e.preventDefault();
        } else {
            globalLocalState.caretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
            if (globalLocalState.caretLoc === 0) {
                Tree.backspaceAtBeginning(globalTree, globalLocalState);
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
        Cursor.setCursorLoc(el[0], globalLocalState.caretLoc);
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

    if (this.props.node.completed) {
        contentClassName += " completed";
    }

    var bulletPoint = '';
    if (!this.props.topBullet) {
        bulletPoint = (<span onClick={this.toggle} className={className}>{String.fromCharCode(8226)}</span>);
    }

    var children = '';
    if (this.props.topBullet || !this.props.node.collapsed) {
        children = (<TreeChildren childNodes={this.props.node.childNodes} />);
    }

    if (this.props.node.completed && globalCompletedHidden && !this.props.topBullet) {
        return false;
    }

    return (
        <div className='node-wrapper'>
        <div className="node-direct-wrapper">
        {bulletPoint}
        <div className={contentClassName} contentEditable
            ref="input"
            onKeyDown={this.handleKeyDown}
            onInput={this.handleChange}
            onFocus={this.handleClick}
            onClick={this.handleClick}
            dangerouslySetInnerHTML={{__html: _.escape(this.props.node.title)}}>
        </div>
        </div>
        {children}
        </div>
    );
},

toggle: function() {
    console.log(this.props);
    var currentNode = Tree.findFromUUID(globalTree, this.props.node.uuid);
    globalTree.selected = currentNode.uuid;
    Tree.collapseCurrent(globalTree);
    renderAll();
}
});

var startRender = function(parseTree) {
    globalTree = Tree.fromString(parseTree.get('tree'));
    console.log(globalTree);
    console.log('hidden is', Tree.isCompletedHidden(globalTree));
    globalCompletedHidden = Tree.isCompletedHidden(globalTree);
    globalParseTree = parseTree;
    var newTree = Tree.clone(globalTree);
    globalUndoRing = new UndoRing(newTree, 50);
    renderAll();

    setInterval(function () {
        if (!globalDataSaved) {
            globalParseTree.set('tree', Tree.toString(globalTree));
            globalParseTree.save();
            globalDataSaved = true;
            renderAllNoUndo();
        }
        globalUndoRing.commit();
    }, 2000);
}


function renderAll() {
    // TODO speedup by removing clone. I might not need to clone. What this does is allow us to
    // use shouldComponentUpdate. If we have two versions of the tree, then we can compare if one
    // changed relative to the other, and we don't have to call render. But, we have to clone, which
    // may be slow.
    var newTree = Tree.clone(globalTree);
    if (!_.isEqual(globalOldTree, Tree.cloneNoParentNoCursor(globalTree))) {
        globalDataSaved = false;
        globalUndoRing.addPending(newTree);
        globalOldTree = Tree.cloneNoParentNoCursor(globalTree);
    }
    doRender(newTree);
};

function renderAllNoUndo() {
    var newTree = Tree.clone(globalTree);
    doRender(newTree);
}

function doRender(tree) {
    //console.log('rendering with', Tree.toString(tree));

    // TODO should always have a zoom?
    //<TreeChildren childNodes={tree.zoom.childNodes} />
    if (tree.zoom !== undefined) {
        React.render(
          <div>
          <ResetButton/> | <a href="import.html">Import</a> | <DataSaved /> | <CompleteHiddenButton /> | <SearchBox />
          <div><Breadcrumb node={tree} /></div>
          <TreeNode topBullet={true} node={tree.zoom}/>
          </div>,
          document.getElementById("tree")
        );
    } else {
        console.assert(false, 'I didn\'t think this would happen');
        //console.log('no zoom');
        //React.render(
          //<div>
      //<ResetButton/> | <a href="import.html">Import</a> | <DataSaved />
          //<div><Breadcrumb node={tree} /></div>
          //<TreeNode node={tree}/>
          //</div>,
          //document.getElementById("tree")
        //);
    }
}

module.exports = startRender;

