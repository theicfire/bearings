var React = require('react');
var Tree = require('./lib/Tree');
var $ = require('jquery');
var Cursor = require('./lib/Cursor');

var globalTree;

var TreeChildren = React.createClass({
render: function() {
    var childNodes;
    if (this.props.childNodes != null) {
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
      visible: true,
      title: this.props.node.title
    };
},

handleChange: function(event) {
    var selected = Tree.findSelected(globalTree);
    selected.title = event.target.value;
    var caretLoc = Cursor.getCaretPosition(this.refs.input.getDOMNode());
    selected.caretLoc = caretLoc;
    this.setState({visible: this.state.visible, title: event.target.value});
},

componentDidMount: function() {
    if (this.props.node.selected) {
        var el = $(this.getDOMNode()).children('h5').children('input');
        el.focus();
        Cursor.setCaretPosition(el.get(0), this.props.node.caretLoc);
    }
},

handleKeyDown: function(e) {
    var KEYS = {LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, TAB: 9, BACKSPACE: 8};
    if (e.keyCode === KEYS.LEFT) {
        console.log('left');
    } else if (e.keyCode === KEYS.UP) {
        if (e.shiftKey && e.altKey) {
            console.log('shift up');
            Tree.shiftUp(globalTree);
        } else {
            console.log('up');
            Tree.selectPreviousNode(globalTree);
            Tree.findSelected(globalTree).caretLoc = 0;
        }
        renderAll();
        e.preventDefault();
    } else if (e.keyCode === KEYS.RIGHT) {
        console.log('right');
    } else if (e.keyCode === KEYS.DOWN) {
        if (e.shiftKey && e.altKey) {
            Tree.shiftDown(globalTree);
        } else {
            console.log('down');
            Tree.selectNextNode(globalTree);
            Tree.findSelected(globalTree).caretLoc = 0;
        }
        renderAll();
        console.log('tree now', globalTree);
        e.preventDefault();
    } else if (e.keyCode === KEYS.ENTER) {
        var selected = Tree.findSelected(globalTree);
        var caretLoc = Cursor.getCaretPosition(this.refs.input.getDOMNode());
        selected.caretLoc = caretLoc;
        console.log('loc', caretLoc);
        Tree.newLineAtCursor(globalTree);
        renderAll();
        e.preventDefault();
    } else if (e.keyCode === KEYS.BACKSPACE) {
        var caretLoc = Cursor.getCaretPosition(this.refs.input.getDOMNode());
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

    } else {
        console.log(e.keyCode);
    }
},

componentDidUpdate: function(prevProps, prevState) {
    if (this.props.node.selected) {
        var el = $(this.getDOMNode()).children('h5').children('input');
        el.focus();
    }
},

componentWillReceiveProps: function(nextProps) {
    this.setState({visible: this.state.visible, title: nextProps.node.title});
},

// TODO good for speedups..
//shouldComponentUpdate: function(nextProps, nextState) {
    //return !(_.isEqual(this.state, nextState) && _.isEqual(this.props, nextProps));
//},

render: function() {
    var className = "dot";
    if (this.props.node.childNodes != null) {
        className = "dot togglable";
        if (this.state.visible) {
            className += " togglable-down";
        } else {
            className += " togglable-up";
        }
    }

    var style = {};
    if (!this.state.visible) {
        style.display = "none";
    }

    return (
        <div>
        <h5>
        <span onClick={this.toggle} className={className}>{String.fromCharCode(8226)}</span>
        <input ref="input" type="text" value={this.state.title} onKeyDown={this.handleKeyDown} onChange={this.handleChange}/> {this.props.node.parent ? 'parent: ' + this.props.node.parent.title : ''}
        </h5>
        <TreeChildren style={style} childNodes={this.props.node.childNodes} />
        </div>
    );
},

toggle: function() {
    this.setState({visible: !this.state.visible, title: this.state.title});
}
});

var startRender = function(tree) {
    globalTree = tree;
    renderAll();
}

function renderAll() {
    console.log('rendering with', globalTree);
    console.log('to ', document.getElementById("tree"));
    // TODO speedup by removing clone. I might not need to clone. What this does is allow us to
    // use shouldComponentUpdate. If we have two versions of the tree, then we can compare if one
    // changed relative to the other, and we don't have to call render. But, we have to clone, which
    // may be slow.
    var newTree = Tree.clone(globalTree);
    React.renderComponent(
      <TreeChildren style={{}} childNodes={newTree.childNodes} />,
      document.getElementById("tree")
    );
};

module.exports = startRender;

