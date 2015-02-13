define(['react', 'tree', 'jquery', 'underscore'], function(React, Tree, $, _) {
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


    //testSelectNext();
    return TreeNode;
});





























//var testSelectAndNext = function() {
    //var selected, next;
    //var tree = {
      //title: "howdy",
      //childNodes: [
        //{title: "bobby", selected: "true"},
        //{title: "suzie", childNodes: [
          //{title: "puppy", childNodes: [
            //{title: "dog house"}
          //]},
          //{title: "cherry thing"}
        //]}
      //]
    //};
    //selected = Tree.findSelected(Tree.makeTree(tree));
    //next = Tree.findNextNode(selected);
    //console.assert(selected.title === 'bobby');
    //console.assert(next.title === 'suzie');

    //var treeNext = {
      //title: "howdy",
      //childNodes: [
        //{title: "bobby"},
        //{title: "suzie", selected: true, childNodes: [
          //{title: "puppy", childNodes: [
            //{title: "dog house"}
          //]},
          //{title: "cherry thing"}
        //]}
      //]
    //};
    //selected = Tree.findSelected(Tree.makeTree(treeNext));
    //next = Tree.findNextNode(selected);
    //console.assert(selected.title === 'suzie');
    //console.assert(next.title === 'puppy');

    //var treeNext2 = {
      //title: "howdy",
      //childNodes: [
        //{title: "bobby"},
        //{title: "suzie", childNodes: [
          //{title: "puppy", childNodes: [
            //{title: "dog", selected: true}
          //]},
          //{title: "cherry"}
        //]}
      //]
    //};
    //selected = Tree.findSelected(Tree.makeTree(treeNext2));
    //next = Tree.findNextNode(selected);
    //console.assert(selected.title === 'dog');
    //console.assert(next.title === 'cherry');

    //var treeNext3 = {
      //title: "howdy",
      //childNodes: [
        //{title: "bobby"},
        //{title: "suzie", childNodes: [
          //{title: "puppy", childNodes: [
            //{title: "dog"}
          //]},
          //{title: "cherry", selected: true}
        //]}
      //]
    //};
    //selected = Tree.findSelected(Tree.makeTree(treeNext3));
    //next = Tree.findNextNode(selected);
    //console.assert(selected.title === 'cherry');
    //console.assert(next === null);
//};

//var testSelectNextNode = function() {
    //var tree = Tree.makeTree({
      //title: "howdy",
      //childNodes: [
        //{title: "bobby", selected: "true"},
        //{title: "suzie", childNodes: [
          //{title: "puppy", childNodes: [
            //{title: "dog house"}
          //]},
          //{title: "cherry thing"}
        //]}
      //]
    //});

    //var treeNext = Tree.makeTree({
      //title: "howdy",
      //childNodes: [
        //{title: "bobby"},
        //{title: "suzie", selected: true, childNodes: [
          //{title: "puppy", childNodes: [
            //{title: "dog house"}
          //]},
          //{title: "cherry thing"}
        //]}
      //]
      //});
    //Tree.selectNextNode(tree);
    //console.log('compare', tree);
    //console.log('compare2', treeNext);
    //console.assert(_.isEqual(tree, treeNext));
//};

//var testSelectAndNextReverse = function() {
    //var tree = {
      //title: "howdy",
      //childNodes: [
        //{title: "bobby", selected: "true"},
        //{title: "suzie", childNodes: [
          //{title: "puppy", childNodes: [
            //{title: "dog house"}
          //]},
          //{title: "cherry thing"}
        //]}
      //]
    //};
    //selected = Tree.findSelected(Tree.makeTree(tree));
    //next = Tree.findPreviousNode(selected);
    //console.assert(selected.title === 'bobby');
    //console.assert(next.title === 'howdy');

    //var treeNext = {
      //title: "howdy",
      //childNodes: [
        //{title: "bobby"},
        //{title: "suzie", selected: true, childNodes: [
          //{title: "puppy", childNodes: [
            //{title: "dog house"}
          //]},
          //{title: "cherry thing"}
        //]}
      //]
    //};
    //selected = Tree.findSelected(Tree.makeTree(treeNext));
    //next = Tree.findPreviousNode(selected);
    //console.assert(selected.title === 'suzie');
    //console.assert(next.title === 'bobby');

    //var treeNext2 = {
      //title: "howdy", selected: true,
      //childNodes: [
        //{title: "bobby"},
        //{title: "suzie", childNodes: [
          //{title: "puppy", childNodes: [
            //{title: "dog"}
          //]},
          //{title: "cherry"}
        //]}
      //]
    //};
    //selected = Tree.findSelected(Tree.makeTree(treeNext2));
    //next = Tree.findPreviousNode(selected);
    //console.assert(selected.title === 'howdy');
    //console.assert(next === null);

    //var treeNext3 = {
      //title: "howdy",
      //childNodes: [
        //{title: "bobby"},
        //{title: "suzie", childNodes: [
          //{title: "puppy", childNodes: [
            //{title: "dog"}
          //]},
          //{title: "cherry", selected: true,}
        //]}
      //]
    //};
    //selected = Tree.findSelected(Tree.makeTree(treeNext3));
    //next = Tree.findPreviousNode(selected);
    //console.assert(selected.title === 'cherry');
    //console.assert(next.title === 'dog');
//};

//var testSelectNext = function() {
    //var treeNext2 = {
      //title: "howdy",
      //childNodes: [
        //{title: "bobby"},
        //{title: "suzie", childNodes: [
          //{title: "puppy", childNodes: [
            //{title: "dog", selected: true}
          //]},
          //{title: "cherry"}
        //]}
      //]
    //};
    //var tree = Tree.makeTree(treeNext2).childNodes[1].childNodes[0].childNodes[0];
    //console.log('tree tester', tree);
    //var next = Tree.findNextNode(tree);
    //console.log('NEXT', next);
//}
//testSelectAndNext();
//testSelectAndNextReverse();
//testSelectNextNode();
