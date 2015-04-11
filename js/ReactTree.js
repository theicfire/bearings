var React = require('react/addons');
var Tree = require('./lib/Tree');
var $ = require('jquery');
var Cursor = require('./lib/Cursor');
var _ = require('underscore');
var UndoRing = require('./lib/UndoRing');

var globalTree;
var globalOldTree;
var globalParseTree;
var globalUndoRing;
var globalDataSaved = false;

var Breadcrumb = React.createClass({
    render: function() {
        return (<b>{this.breadcrumbToText(Tree.getBreadcrumb(this.props.node))}</b>);
    },
    breadcrumbToText: function(titles) {
        return titles.join(' > ');
    }
});

var ResetButton = React.createClass({
    render: function() {
        return (<a href="#" onClick={this.handleClick}>Reset</a>);
    },
    handleClick: function(e) {
        console.log('reset');
        var rawStartTree =
          [{title: "howdy", selected: "true", caretLoc: 0,
              childNodes: [
                {title: "billy"},
                {title: "suzie", childNodes: [
                  {title: "puppy", childNodes: [
                    {title: "dog house"}
                  ]},
                  {title: "cherry thing"}
                ]}
            ]}];
        //for (var i = 0; i < 10000; i++) {
          //startTree.push({title: "oh baby"});
        //}
        rawStartTree.push({title: "the end"});

        globalTree = Tree.makeTree(rawStartTree);
        renderAll();
        e.preventDefault();
    }
});

var TreeChildren = React.createClass({
render: function() {
    var childNodes;
    if (this.props.childNodes != null) {
        var that = this;
        childNodes = this.props.childNodes.map(function(node, index) {
            return <li key={index}><TreeNode node={node} indexer={that.props.indexer + '-' + index} /></li>
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
    var html = this.refs.input.getDOMNode().innerHTML;
    if (html !== this.lastHtml) {
        var currentNode = Tree.findFromIndexer(globalTree, this.props.indexer);
        currentNode.title = event.target.innerHTML;
        currentNode.caretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
        renderAll();
    } else {
        console.assert(false, 'Why am I getting a change event if nothing changed?');
    }
    this.lastHtml = html;
},

handleClick: function(event) {
    var currentNode = Tree.findFromIndexer(globalTree, this.props.indexer);
    var selected = Tree.findSelected(globalTree);
    delete selected.selected;
    currentNode.selected = true;
    currentNode.caretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
},

componentDidMount: function() {
    if (this.props.node.selected) {
        var el = $(this.refs.input.getDOMNode());
        el.focus();
        Cursor.setCursorLoc(el[0], this.props.node.caretLoc);
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
        END: 35,
        HOME: 36,
        SPACE: 32};
    if (e.keyCode === KEYS.LEFT) {
        if (e.altKey) {
            Tree.zoomOutOne(globalTree);
            renderAll();
            e.preventDefault();
        } else {
            var newCaretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
            if (newCaretLoc === 0) {
                Tree.selectPreviousNode(globalTree);
                var selected = Tree.findSelected(globalTree); // TODO could do this faster than two searches
                selected.caretLoc = selected.title.length;
                renderAll();
                e.preventDefault();
            } else {
                var currentNode = Tree.findFromIndexer(globalTree, this.props.indexer);
                currentNode.caretLoc = newCaretLoc - 1;
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
        if (e.shiftKey && e.altKey) {
            Tree.shiftUp(globalTree);
        } else {
            Tree.selectPreviousNode(globalTree);
            Tree.findSelected(globalTree).caretLoc = 0; // TODO could be faster
        }
        renderAll();
        e.preventDefault();
    } else if (e.keyCode === KEYS.RIGHT) {
        var currentNode = Tree.findFromIndexer(globalTree, this.props.indexer);
        if (e.altKey) {
            Tree.zoom(currentNode);
            renderAll();
            e.preventDefault();
        } else {
            var newCaretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
            if (newCaretLoc === this.refs.input.getDOMNode().innerHTML.length) {
                Tree.selectNextNode(globalTree);
                var selected = Tree.findSelected(globalTree); // TODO could do this faster then two searches
                selected.caretLoc = 0;
                renderAll();
                e.preventDefault();
            } else {
                currentNode.caretLoc = newCaretLoc + 1;
            }
        }
    } else if (e.keyCode === KEYS.DOWN) {
        if (e.shiftKey && e.altKey) {
            Tree.shiftDown(globalTree);
        } else {
            console.log('down');
            Tree.selectNextNode(globalTree);
            Tree.findSelected(globalTree).caretLoc = 0; // TODO could be faster
        }
        renderAll();
        e.preventDefault();
    } else if (e.keyCode === KEYS.ENTER) {
        var currentNode = Tree.findFromIndexer(globalTree, this.props.indexer);
        var caretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
        currentNode.caretLoc = caretLoc;
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
            var caretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
            if (caretLoc === 0) {
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
    } else if (e.keyCode === KEYS.Z && e.ctrlKey) {
        globalTree = Tree.clone(globalUndoRing.undo());
        renderAllNoUndo();
        e.preventDefault();
    } else if (e.keyCode === KEYS.Y && e.ctrlKey) {
        globalTree = Tree.clone(globalUndoRing.redo());
        renderAllNoUndo();
        e.preventDefault();
    } else if (e.keyCode === KEYS.S && e.ctrlKey) {
        console.log('ctrl s');
        console.log(JSON.stringify(Tree.cloneNoParentClean(globalTree), null, 4));
        e.preventDefault();
    } else {
        console.log(e.keyCode);
    }
},

componentDidUpdate: function(prevProps, prevState) {
    if (this.props.node.selected) {
        var el = $(this.refs.input.getDOMNode());
        el.focus();
        Cursor.setCursorLoc(el[0], this.props.node.caretLoc);
    }
    if ( this.props.node.title !== this.refs.input.getDOMNode().innerHTML ) {
        // Need this because of: http://stackoverflow.com/questions/22677931/react-js-onchange-event-for-contenteditable/27255103#27255103
        // An example he was mentioning is that the virtual dom thinks that the div is empty, but if
        // you type something and then press "clear", or specifically set the text, the VDOM will
        // think the two are the same.
        // I believe this will never happen for me though? Because I don't overtly set text.. text is only set when someone is typing, right?
        //this.refs.input.getDOMNode().innerHTML = this.props.node.title;
        console.assert(false, 'Did not expect this to get hit. My thoughts are wrong. Check out the comments.');
    }
},

// TODO good for speedups..
//shouldComponentUpdate: function(nextProps, nextState) {
    //return !_.isEqual(this.props, nextProps);
//},
// TODO something about cursor jumps need this?
// See: http://stackoverflow.com/questions/22677931/react-js-onchange-event-for-contenteditable/27255103#27255103
// I think what "cursor jump" means is that if we set the innerHTML for some reason, but we are
// actually just setting it to be the exact same html, then the cursor will jump to the front/end.
//shouldComponentUpdate: function(nextProps){
        //return nextProps.html !== this.getDOMNode().innerHTML;
    //},

render: function() {
    var className = "dot";
    if (this.props.node.childNodes != null) {
        className = "dot togglable";
        if (this.props.node.collapsed) {
            className += " dot-collapsed";
        }
    }

    var style = {};
    if (this.props.node.collapsed) {
        style.display = "none";
    }

    return (
        <div className="node-wrapper">
        <div className="node-direct-wrapper">
        <span onClick={this.toggle} className={className}>{String.fromCharCode(8226)}</span>
        <div className="editable" contentEditable
            ref="input"
            onKeyDown={this.handleKeyDown}
            onInput={this.handleChange}
            onClick={this.handleClick}
            dangerouslySetInnerHTML={{__html: this.props.node.title}}>
        </div>
        </div>
        <TreeChildren style={style} childNodes={this.props.node.childNodes} indexer={this.props.indexer} />
        </div>
    );
},

toggle: function() {
    console.assert(false);
}
});

var startRender = function(parseTree) {
    globalTree = Tree.fromString(parseTree.get('tree'));
    globalParseTree = parseTree;
    var newTree = Tree.clone(globalTree);
    globalUndoRing = new UndoRing(newTree, 50);
    renderAll();
    React.render(
      <ResetButton/>,
      document.getElementById("reset-button")
    );

    setInterval(function () {
        if (!globalDataSaved) {
            globalParseTree.set('tree', Tree.toString(globalTree));
            globalParseTree.save();
            globalDataSaved = true;
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
    globalDataSaved = false;

    // TODO should always have a zoom?
    //<TreeChildren childNodes={tree.zoom.childNodes} indexer={Tree.getPath(tree.zoom)} />
    if (tree.zoom !== undefined) {
        React.render(
          <div>
          <Breadcrumb node={tree} />
          <TreeNode node={tree.zoom}  indexer={Tree.getPath(tree.zoom)}/>
          </div>,
          document.getElementById("tree")
        );
    } else {
        React.render(
          <div>
          <Breadcrumb node={tree} />
          <TreeNode node={tree}  indexer=""/>
          </div>,
          document.getElementById("tree")
        );
    }
}

module.exports = startRender;

