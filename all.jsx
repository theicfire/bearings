var TreeNode = React.createClass({
  getInitialState: function() {
    return {
      visible: true
    };
  },
  componentDidMount: function() {
      console.log('mounted', this.props.node.title, this.props.node.selected);
      if (this.props.node.selected) {
        $(this.getDOMNode()).children('h5').children('div').focus();
      }
  },
  componentDidUpdate: function(prevProps, prevState) {
      console.log('did update', this.props.node.title, this.props.node.selected);
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

var renderAll = function() {
    React.renderComponent(
      <TreeNode node={tree} />,
      document.getElementById("tree")
    );
};
renderAll();

var selectNextNode = function(tree) {
    var found = findSelectedAndNext(tree);
    if (found.next) {
        if (found.selected) {
            delete found.selected.selected;
        }
        found.next.selected = true;
    }
};

var selectPreviousNode = function(tree) {
    var found = findSelectedAndNextReverse(tree);
    if (found.next) {
        if (found.selected) {
            delete found.selected.selected;
        }
        found.next.selected = true;
    }
};

var findSelectedAndNext = function(tree) {
    if (tree.selected) {
        if (tree.childNodes && tree.childNodes.length > 0) {
            return {selected: tree, next: tree.childNodes[0]};
        }
        return {selected: tree, next: null};
    }
    var found = {};
    if (tree.childNodes) {
        for (var i = 0; i < tree.childNodes.length; i++) {
            found = findSelectedAndNext(tree.childNodes[i]);
            if (found.selected) {
                break;
            }
        }
    }
    if (found.selected) {
        // see if there's a sibling, otherwise go up in the tree
        if (!found.next) {
            if (i + 1 < tree.childNodes.length) {
                return {selected: found.selected, next: tree.childNodes[i + 1]};
            }
        }
        return found;
    }
    return {};
};

var findSelectedAndNextReverse = function(tree) {
    if (tree.selected) {
        return {selected: tree, next: null};
    }
    var found = {};
    if (tree.childNodes) {
        for (var i = tree.childNodes.length - 1; i >= 0; i--) {
            found = findSelectedAndNextReverse(tree.childNodes[i]);
            if (found.selected) {
                break;
            }
        }
    }
    if (found.selected) {
        // see if there's a sibling, otherwise go up in the tree
        if (!found.next) {
            if (i - 1 >= 0) {
                return {selected: found.selected, next: tree.childNodes[i - 1]};
            } else {
                return {selected: found.selected, next: tree};
            }
        }
        return found;
    }
    return {};
};

var testSelectAndNext = function() {
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
    var pair = findSelectedAndNext(tree);
    console.assert(pair.selected.title === 'bobby');
    console.assert(pair.next.title === 'suzie');

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
    pair = findSelectedAndNext(treeNext);
    console.assert(pair.selected.title === 'suzie');
    console.assert(pair.next.title === 'puppy');

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
    pair = findSelectedAndNext(treeNext2);
    console.assert(pair.selected.title === 'dog');
    console.assert(pair.next.title === 'cherry');

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
    pair = findSelectedAndNext(treeNext3);
    console.assert(pair.selected.title === 'cherry');
    console.assert(pair.next === null);
};

var testSelectNextNode = function() {
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
    selectNextNode(tree);
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
    var pair = findSelectedAndNextReverse(tree);
    console.assert(pair.selected.title === 'bobby');
    console.assert(pair.next.title === 'howdy');

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
    pair = findSelectedAndNextReverse(treeNext);
    console.assert(pair.selected.title === 'suzie');
    console.assert(pair.next.title === 'bobby');

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
    pair = findSelectedAndNextReverse(treeNext2);
    console.assert(pair.selected.title === 'howdy');
    console.assert(pair.next === null);
};

console.log('ready');
testSelectAndNext();
testSelectAndNextReverse();
testSelectNextNode();
$('#tree').keydown(function(e) {
    if (e.keyCode === 37) {
        console.log('left');
    } else if (e.keyCode === 38) {
        console.log('up');
        selectPreviousNode(tree);
        renderAll();
    } else if (e.keyCode === 39) {
        console.log('right');
    } else if (e.keyCode === 40) {
        console.log('down');
        selectNextNode(tree);
        renderAll();
        console.log('tree now', tree);
    }
});

