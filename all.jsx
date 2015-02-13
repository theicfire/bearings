var TreeNode = React.createClass({
  getInitialState: function() {
    return {
      visible: true
    };
  },
  componentDidMount: function() {
      //console.log('mounted', this.props.node.title, this.props.node.selected);
      if (this.props.node.selected) {
        $(this.getDOMNode()).children('h5').children('div').focus();
      }
  },
  componentDidUpdate: function(prevProps, prevState) {
      //console.log('did update', this.props.node.title, this.props.node.selected);
      if (this.props.node.selected) {
        $(this.getDOMNode()).children('h5').children('div').focus();
      }
  },
  render: function() {
    var childNodes;
    var className = "dot";
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
          <div className="text" onClick={this.textclick} onBlur={this.blur} contentEditable="true">{this.props.node.title}</div>
        </h5>
        <ul style={style}>
          {childNodes}
        </ul>
      </div>
    );
  },
  toggle: function() {
    this.setState({visible: !this.state.visible});
  }
//  textclick: function() {
//    console.log('text clicked', this);
//    this.getDOMNode().contentEditable = true;
//    this.getDOMNode().focus();
//  },
});

var selectNextNode = function(tree) {
    var selected = findSelected(tree);
    var next = findNextNode(selected);
    if (next) {
        if (selected) {
            selected.selected = undefined;
        }
        next.selected = true;
    }
};

var selectPreviousNode = function(tree) {
    var selected = findSelected(tree);
    var previous = findPreviousNode(selected);
    if (previous) {
        if (previous) {
            selected.selected = undefined;
        }
        previous.selected = true;
    }
};

// Add a child at "selected"
var addChild = function(tree) {

}

var findDeepest = function(tree) {
    if (tree.childNodes && tree.childNodes.length > 0) {
        return findDeepest(tree.childNodes[tree.childNodes.length - 1]);
    }
    return tree;
};

var testSelectAndNext = function() {
    var selected, next;
    var tree = {
      title: "howdy",
      childNodes: [
        {title: "bobby", selected: "true"},
        {title: "suzie", childNodes: [
          {title: "puppy", childNodes: [
            {title: "dog house"}
          ]},
          {title: "cherry thing"}
        ]}
      ]
    };
    selected = findSelected(makeTree(tree));
    next = findNextNode(selected);
    console.assert(selected.title === 'bobby');
    console.assert(next.title === 'suzie');

    var treeNext = {
      title: "howdy",
      childNodes: [
        {title: "bobby"},
        {title: "suzie", selected: true, childNodes: [
          {title: "puppy", childNodes: [
            {title: "dog house"}
          ]},
          {title: "cherry thing"}
        ]}
      ]
    };
    selected = findSelected(makeTree(treeNext));
    next = findNextNode(selected);
    console.assert(selected.title === 'suzie');
    console.assert(next.title === 'puppy');

    var treeNext2 = {
      title: "howdy",
      childNodes: [
        {title: "bobby"},
        {title: "suzie", childNodes: [
          {title: "puppy", childNodes: [
            {title: "dog", selected: true}
          ]},
          {title: "cherry"}
        ]}
      ]
    };
    selected = findSelected(makeTree(treeNext2));
    next = findNextNode(selected);
    console.assert(selected.title === 'dog');
    console.assert(next.title === 'cherry');

    var treeNext3 = {
      title: "howdy",
      childNodes: [
        {title: "bobby"},
        {title: "suzie", childNodes: [
          {title: "puppy", childNodes: [
            {title: "dog"}
          ]},
          {title: "cherry", selected: true}
        ]}
      ]
    };
    selected = findSelected(makeTree(treeNext3));
    next = findNextNode(selected);
    console.assert(selected.title === 'cherry');
    console.assert(next === null);
};

var testSelectNextNode = function() {
    var tree = makeTree({
      title: "howdy",
      childNodes: [
        {title: "bobby", selected: "true"},
        {title: "suzie", childNodes: [
          {title: "puppy", childNodes: [
            {title: "dog house"}
          ]},
          {title: "cherry thing"}
        ]}
      ]
    });

    var treeNext = makeTree({
      title: "howdy",
      childNodes: [
        {title: "bobby"},
        {title: "suzie", selected: true, childNodes: [
          {title: "puppy", childNodes: [
            {title: "dog house"}
          ]},
          {title: "cherry thing"}
        ]}
      ]
      });
    selectNextNode(tree);
    console.log('compare', tree);
    console.log('compare2', treeNext);
    console.assert(_.isEqual(tree, treeNext));
};

var testSelectAndNextReverse = function() {
    var tree = {
      title: "howdy",
      childNodes: [
        {title: "bobby", selected: "true"},
        {title: "suzie", childNodes: [
          {title: "puppy", childNodes: [
            {title: "dog house"}
          ]},
          {title: "cherry thing"}
        ]}
      ]
    };
    selected = findSelected(makeTree(tree));
    next = findPreviousNode(selected);
    console.assert(selected.title === 'bobby');
    console.assert(next.title === 'howdy');

    var treeNext = {
      title: "howdy",
      childNodes: [
        {title: "bobby"},
        {title: "suzie", selected: true, childNodes: [
          {title: "puppy", childNodes: [
            {title: "dog house"}
          ]},
          {title: "cherry thing"}
        ]}
      ]
    };
    selected = findSelected(makeTree(treeNext));
    next = findPreviousNode(selected);
    console.assert(selected.title === 'suzie');
    console.assert(next.title === 'bobby');

    var treeNext2 = {
      title: "howdy", selected: true,
      childNodes: [
        {title: "bobby"},
        {title: "suzie", childNodes: [
          {title: "puppy", childNodes: [
            {title: "dog"}
          ]},
          {title: "cherry"}
        ]}
      ]
    };
    selected = findSelected(makeTree(treeNext2));
    next = findPreviousNode(selected);
    console.assert(selected.title === 'howdy');
    console.assert(next === null);

    var treeNext3 = {
      title: "howdy",
      childNodes: [
        {title: "bobby"},
        {title: "suzie", childNodes: [
          {title: "puppy", childNodes: [
            {title: "dog"}
          ]},
          {title: "cherry", selected: true,}
        ]}
      ]
    };
    selected = findSelected(makeTree(treeNext3));
    next = findPreviousNode(selected);
    console.assert(selected.title === 'cherry');
    console.assert(next.title === 'dog');
};

var testSelectNext = function() {
    var treeNext2 = {
      title: "howdy",
      childNodes: [
        {title: "bobby"},
        {title: "suzie", childNodes: [
          {title: "puppy", childNodes: [
            {title: "dog", selected: true}
          ]},
          {title: "cherry"}
        ]}
      ]
    };
    var tree = makeTree(treeNext2).childNodes[1].childNodes[0].childNodes[0];
    console.log('tree tester', tree);
    var next = findNextNode(tree);
    console.log('NEXT', next);
}

var findSelected = function(node) {
    if (node.selected) {
        return node;
    }
    for (var i = 0; i < node.childNodes.length; i++) {
        var found = findSelected(node.childNodes[i]);
        if (found) {
            return found;
        }
    }
    return null;
};

var findNextNode = function(tree) {
    if (tree.childNodes && tree.childNodes.length > 0) {
        return tree.childNodes[0];
    }
    return findNextNodeRec(tree);
};

var findPreviousNode = function(tree) {
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
        return findDeepest(tree.parent.childNodes[i - 1]);
    }
    return tree.parent;
};

var findNextNodeRec = function(tree) {
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
    return findNextNodeRec(tree.parent);
};


var findPreviousNodeRec = function(tree) {
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
    return findPreviousNodeRec(tree.parent);
}

var makeTree = function(node, parent) {
    var me = {title: node.title, selected: node.selected, childNodes: [], parent: parent};
    if (node.childNodes) {
        me.childNodes = node.childNodes.map(function (node) {
            return makeTree(node, me);
        });
    }
    return me;
};

var tree = makeTree({
  title: "howdy",
  childNodes: [
    {title: "bobby", selected: "true"},
    {title: "suzie", childNodes: [
      {title: "puppy", childNodes: [
        {title: "dog house"}
      ]},
      {title: "cherry thing"}
    ]}
  ]
});

var renderAll = function() {
    React.renderComponent(
      <TreeNode node={tree} />,
      document.getElementById("tree")
    );
};
renderAll();

console.log('ready', makeTree(tree));
testSelectAndNext();
testSelectAndNextReverse();
testSelectNextNode();
//testSelectNext();
$('#tree').keydown(function(e) {
    if (e.keyCode === 37) {
        console.log('left');
        return false;
    } else if (e.keyCode === 38) {
        console.log('up');
        selectPreviousNode(tree);
        renderAll();
        return false;
    } else if (e.keyCode === 39) {
        console.log('right');
        return false;
    } else if (e.keyCode === 40) {
        console.log('down');
        selectNextNode(tree);
        renderAll();
        console.log('tree now', tree);
        return false;
    } else if (e.keyCode === 13) {
        return false;

    }
});

