var _ = require('underscore');
var $ = require('jquery');
var StartRender = require('./TreeNode');
var Tree = require('./lib/Tree');
var Parse = require('parse').Parse;
Parse.initialize("R7ngCzUNFlUFW2jZO90HfG7Pgr8Roa0dgIsFknNJ", "hvTrWozZrInn3qmEuE2zlscYBNRwUWjkndcIwIOL");

//var startTree =
  //[{title: "howdy", selected: "true", caretLoc: 0,
      //childNodes: [
        //{title: "billy"},
        //{title: "suzie", childNodes: [
          //{title: "puppy", childNodes: [
            //{title: "dog house"}
          //]},
          //{title: "cherry thing"}
        //]}
    //]}];
  ////for (var i = 0; i < 10000; i++) {
      ////startTree.push({title: "oh baby"});
  ////}
  //startTree.push({title: "the end"});

//var tree = Tree.makeTree(startTree);

var TestObject = Parse.Object.extend("TestObject");
var query = new Parse.Query(TestObject);
query.get("qJbAFzSI53", {
    success: function (parseTree) {
        StartRender(parseTree);
    },
    error: function(obj, error) {
        throw('Error loading tree' + obj + error);
    }
});

testTree(Tree);

function testFromString() {
    var startTree =
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

    var tree = Tree.makeTree(startTree);
    console.assert(Tree.toString(tree) === Tree.toString(Tree.fromString(Tree.toString(tree))));
};

function testNotRemoveNode() {
    (function() {
        var tree;
        tree = Tree.makeTree([
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: 'dog', selected: true, caretLoc: 0}
              ]},
              {title: "cherry"}
          ]}]);
        var newTree = Tree.makeTree([
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: 'dog', selected: true, caretLoc: 0}
              ]},
              {title: "cherry"}
          ]}]);
        Tree.backspaceAtBeginning(tree);
        console.log('try compare', tree, newTree);
        console.assert(_.isEqual(tree, newTree));
    })();
};

function testRemoveNode() {
    (function() {
        var tree;
        tree = Tree.makeTree([
            {title: "suzie", childNodes: [
                    {title: "puppy"},
                    {title: "cherry", selected: true, caretLoc: 0}
          ]}]);
        var newTree = Tree.makeTree([
            {title: "suzie", childNodes: [
                    {title: "puppycherry", selected: true, caretLoc: 5}
          ]}]);
        Tree.backspaceAtBeginning(tree);
        console.log('try compare', tree, newTree);
        console.assert(_.isEqual(tree, newTree));
    })();
};

function testClone() {
    var tree = Tree.makeTree([
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: 'dog', selected: true, caretLoc: 0}
              ]},
              {title: "cherry"}
          ]}]);
    console.assert(_.isEqual(Tree.clone(tree), tree));
};

function testIndent() {
    var tree = Tree.makeTree([
        {title: "suzie", childNodes: [
                {title: "puppy", childNodes: [
                        {title: 'dog'}
                    ]},
                {title: "cherry", selected: true, caretLoc: 0}
            ]}]);

    var nextTree = Tree.makeTree([
        {title: "suzie", childNodes: [
                {title: "puppy", childNodes: [
                        {title: 'dog'},
                        {title: "cherry", selected: true, caretLoc: 0}
                    ]},
            ]}]);
    Tree.indent(tree);
    console.log('indents', tree, nextTree);
    console.assert(_.isEqual(tree, nextTree));

    tree = Tree.makeTree([
        {title: "suzie", childNodes: [
                {title: "puppy", childNodes: [
                        {title: 'dog', selected: true, caretLoc: 0}
                    ]},
                {title: "cherry"}
            ]}]);

    // No change
    nextTree = Tree.makeTree([
        {title: "suzie", childNodes: [
                {title: "puppy", childNodes: [
                        {title: 'dog', selected: true, caretLoc: 0}
                    ]},
                {title: "cherry"}
            ]}]);
    Tree.indent(tree);
    console.log('indents', tree, nextTree);
    console.assert(_.isEqual(tree, nextTree));
};

function testAddChild() {
    (function() {
        var tree;
        var someTitle = 'dog';
        tree = Tree.makeTree([
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: someTitle, selected: true, caretLoc: someTitle.length}
              ]},
              {title: "cherry"}
          ]}]);
        newTree = Tree.makeTree([
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: someTitle},
                {title: "", selected: true, caretLoc: 0}
              ]},
              {title: "cherry"}
          ]}]);
        Tree.newLineAtCursor(tree);
        console.assert(_.isEqual(tree, newTree));
    })();

    (function() {
        var tree;
        var someTitle = 'dog';
        tree = Tree.makeTree([
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: someTitle, selected: true, caretLoc: 0}
              ]},
              {title: "cherry"}
          ]}]);
        newTree = Tree.makeTree([
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: "", selected: true, caretLoc: 0},
                {title: someTitle}
              ]},
              {title: "cherry"}
          ]}]);
        Tree.newLineAtCursor(tree);
        console.assert(_.isEqual(tree, newTree));
    })();

    (function() {
        var tree;
        var someTitle = 'dog';
        tree = Tree.makeTree([
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: someTitle, selected: true, caretLoc: 1}
              ]},
              {title: "cherry"}
          ]}]);
        newTree = Tree.makeTree([
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: 'd'},
                {title: 'og', selected: true, caretLoc: 0}
              ]},
              {title: "cherry"}
          ]}]);
        Tree.newLineAtCursor(tree);
        console.assert(_.isEqual(tree, newTree));
    })();
};

function testSelectAndNext() {
    var selected, next;
    var tree = [{
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
    }];
    selected = Tree.findSelected(Tree.makeTree(tree));
    next = Tree.findNextNode(selected);
    console.assert(selected.title === 'bobby');
    console.assert(next.title === 'suzie');

    var treeNext = [{
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
    }];
    selected = Tree.findSelected(Tree.makeTree(treeNext));
    next = Tree.findNextNode(selected);
    console.assert(selected.title === 'suzie');
    console.assert(next.title === 'puppy');

    var treeNext2 = [{
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
    }];
    selected = Tree.findSelected(Tree.makeTree(treeNext2));
    next = Tree.findNextNode(selected);
    console.assert(selected.title === 'dog');
    console.assert(next.title === 'cherry');

    var treeNext3 = [{
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
    }];
    selected = Tree.findSelected(Tree.makeTree(treeNext3));
    next = Tree.findNextNode(selected);
    console.assert(selected.title === 'cherry');
    console.assert(next === null);
};

function testSelectNextNode() {
    var tree = Tree.makeTree([{
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
    }]);

    var treeNext = Tree.makeTree([{
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
      }]);
    Tree.selectNextNode(tree);
    console.assert(_.isEqual(tree, treeNext));
};

function testSelectAndNextReverse() {
    var tree = [{
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
    }];
    selected = Tree.findSelected(Tree.makeTree(tree));
    next = Tree.findPreviousNode(selected);
    console.assert(selected.title === 'bobby');
    console.assert(next.title === 'howdy');

    var treeNext = [{
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
    }];
    selected = Tree.findSelected(Tree.makeTree(treeNext));
    next = Tree.findPreviousNode(selected);
    console.assert(selected.title === 'suzie');
    console.assert(next.title === 'bobby');

    var treeNext2 = [{
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
    }];
    selected = Tree.findSelected(Tree.makeTree(treeNext2));
    next = Tree.findPreviousNode(selected);
    console.assert(selected.title === 'howdy');
    console.assert(next === null);

    var treeNext3 = [{
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
    }];
    selected = Tree.findSelected(Tree.makeTree(treeNext3));
    next = Tree.findPreviousNode(selected);
    console.assert(selected.title === 'cherry');
    console.assert(next.title === 'dog');
};

function testSelectNext() {
    var treeNext2 = [{
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
    }];
    // TODO make statements like this more clear about why the first call is childNodes[0]... it's because
    // this is wrapped in some root node.
    var tree = Tree.makeTree(treeNext2).childNodes[0].childNodes[1].childNodes[0].childNodes[0];
    var next = Tree.findNextNode(tree);
    console.assert(next.title === 'cherry');
};

function testPath() {
    var tree = [{
      title: "special_root_title",
      childNodes: [
          {title: "howdy",
          childNodes: [
            {title: "bobby"},
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: "dog", selected: true}
              ]},
              {title: "cherry"}
            ]}
          ]
    }]}];
    var innerTree = Tree.makeTree(tree).childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0];
    var innerTree2 = Tree.makeTree(tree).childNodes[0].childNodes[0];
    console.assert(Tree.getPath(innerTree) === '-0-1-0-0');
    console.assert(Tree.getPath(innerTree2) === '-0');
};

function testTree() {
    testSelectAndNext();
    testSelectAndNextReverse();
    testSelectNextNode();
    testSelectNext();
    testAddChild();
    testNotRemoveNode();
    testRemoveNode();
    testClone();
    testIndent();
    testPath();
    testFromString();
}
