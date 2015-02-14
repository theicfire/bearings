define(['react', 'tree', 'jquery', 'underscore', 'Cursor'], function(React, Tree, $, _, Cursor) {
    var globalTree;

    var TreeNode = React.createClass({
    getInitialState: function() {
        return {
          visible: true,
          title: this.props.node.title,
          caretLoc: this.props.node.caretLoc
        };
    },

    handleChange: function(event) {
        var selected = Tree.findSelected(globalTree);
        selected.title = event.target.value;
        var caretLoc = Cursor.getCaretPosition(this.refs.input.getDOMNode());
        selected.caretLoc = caretLoc;
        this.setState({visible: this.state.visible, title: event.target.value, caretLoc: caretLoc});
    },

    componentDidMount: function() {
        if (this.props.node.selected) {
            var el = $(this.getDOMNode()).children('h5').children('input');
            el.focus();
            Cursor.setCaretPosition(el.get(0), this.state.caretLoc);
        }
    },

    handleKeyDown: function(e) {
        if (e.keyCode === 37) {
            console.log('left');
        } else if (e.keyCode === 38) {
            console.log('up');
            Tree.selectPreviousNode(globalTree);
            Tree.findSelected(globalTree).caretLoc = 0;
            renderAll();
            e.preventDefault();
        } else if (e.keyCode === 39) {
            console.log('right');
        } else if (e.keyCode === 40) {
            console.log('down');
            Tree.selectNextNode(globalTree);
            Tree.findSelected(globalTree).caretLoc = 0;
            renderAll();
            console.log('tree now', globalTree);
            e.preventDefault();
        } else if (e.keyCode === 13) {
            var selected = Tree.findSelected(globalTree);
            var caretLoc = Cursor.getCaretPosition(this.refs.input.getDOMNode());
            selected.caretLoc = caretLoc;
            console.log('loc', caretLoc);
            Tree.newLineAtCursor(globalTree);
            renderAll();
            e.preventDefault();
        } else if (e.keyCode === 8) {
            var caretLoc = Cursor.getCaretPosition(this.refs.input.getDOMNode());
            if (caretLoc === 0) {
                Tree.backspaceAtBeginning(globalTree);
                renderAll();
                e.preventDefault();
            }
        } else {
            console.log(e.keyCode);
        }
    },

    componentDidUpdate: function(prevProps, prevState) {
        if (this.props.node.selected) {
            var el = $(this.getDOMNode()).children('h5').children('input');
            el.focus();
            Cursor.setCaretPosition(el.get(0), this.state.caretLoc);
        }
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({visible: this.state.visible, title: nextProps.node.title, caretLoc: nextProps.node.caretLoc});
    },

    render: function() {
        var childNodes;
        var className = "dot";
        //console.log('render: ', this.props.node);
        if (this.props.node.childNodes != null) {
            childNodes = this.props.node.childNodes.map(function(node, index) {
                    return <li key={index}><TreeNode node={node} /></li>
                });

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
            <ul style={style}>
            {childNodes}
            </ul>
            </div>
        );
    },

    toggle: function() {
        this.setState({visible: !this.state.visible, title: this.state.title, caretLoc: this.state.caretLoc});
    }
    });

    var startRender = function(tree) {
        globalTree = tree;
        renderAll();
    }

    function renderAll() {
        console.log('rendering with', globalTree);
        var newTree = Tree.clone(globalTree);
        React.renderComponent(
          <TreeNode node={newTree} />,
          document.getElementById("tree")
        );
    };

    return startRender;
});

