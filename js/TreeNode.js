var React = require('react/addons');
var Tree = require('./lib/Tree');
var $ = require('jquery');
var Cursor = require('./lib/Cursor');
var _ = require('underscore');
var UndoRing = require('./lib/UndoRing');

var globalTree;
var globalUndoRing;

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
        SPACE: 32};
    if (e.keyCode === KEYS.LEFT) {
        var currentNode = Tree.findFromIndexer(globalTree, this.props.indexer);
        var newCaretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
        if (newCaretLoc > 0) {
            newCaretLoc -= 1;
        }
        currentNode.caretLoc = newCaretLoc;
    } else if (e.keyCode === KEYS.UP) {
        if (e.shiftKey && e.altKey) {
            console.log('shift up');
            Tree.shiftUp(globalTree);
        } else {
            console.log('up');
            Tree.selectPreviousNode(globalTree);
            Tree.findFromIndexer(globalTree, this.props.indexer).caretLoc = 0;
        }
        renderAll();
        e.preventDefault();
    } else if (e.keyCode === KEYS.RIGHT) {
        var currentNode = Tree.findFromIndexer(globalTree, this.props.indexer);
        var newCaretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
        if (newCaretLoc < this.refs.input.getDOMNode().innerHTML.length - 1) {
            newCaretLoc += 1;
        }
        currentNode.caretLoc = newCaretLoc;
    } else if (e.keyCode === KEYS.DOWN) {
        if (e.shiftKey && e.altKey) {
            Tree.shiftDown(globalTree);
        } else {
            console.log('down');
            Tree.selectNextNode(globalTree);
            Tree.findFromIndexer(globalTree, this.props.indexer).caretLoc = 0;
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
        var caretLoc = Cursor.getCaretCharacterOffsetWithin(this.refs.input.getDOMNode());
        if (caretLoc === 0) {
            Tree.backspaceAtBeginning(globalTree);
            renderAll();
            e.preventDefault();
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
        <div>
        <h5>
        <span onClick={this.toggle} className={className}>{String.fromCharCode(8226)}</span>
        <div contentEditable
            ref="input"
            onKeyDown={this.handleKeyDown}
            onInput={this.handleChange}
            onClick={this.handleClick}
            dangerouslySetInnerHTML={{__html: this.props.node.title}}>
        </div>
        {this.props.node.parent ? 'parent: ' + this.props.node.parent.title : ''}
        </h5>
        <TreeChildren style={style} childNodes={this.props.node.childNodes} indexer={this.props.indexer} />
        </div>
    );
},

toggle: function() {
    console.assert(false);
}
});

var startRender = function(tree) {
    globalTree = tree;
    var newTree = Tree.clone(globalTree);
    globalUndoRing = new UndoRing(newTree, 50);
    renderAll();
}

function renderAll() {
    // TODO speedup by removing clone. I might not need to clone. What this does is allow us to
    // use shouldComponentUpdate. If we have two versions of the tree, then we can compare if one
    // changed relative to the other, and we don't have to call render. But, we have to clone, which
    // may be slow.
    var newTree = Tree.clone(globalTree);
    globalUndoRing.add(newTree);
    doRender(newTree);
};

function renderAllNoUndo() {
    var newTree = Tree.clone(globalTree);
    doRender(newTree);
}

function doRender(tree) {
    console.log('rendering with', Tree.toString(tree));
    React.render(
      <TreeChildren style={{}} childNodes={tree.childNodes}  indexer=""/>,
      document.getElementById("tree")
    );
}

module.exports = startRender;

