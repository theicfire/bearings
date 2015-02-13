define(function (require) {
    var Tree = require('tree');
    var _ = require('underscore');
    var $ = require('jquery');
    var React = require('react');
    var Render = require('jsx!app/all');

    var tree = Tree.makeTree({
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

    Render(tree);
    $('#tree').keydown(function(e) {
        if (e.keyCode === 37) {
            console.log('left');
            return false;
        } else if (e.keyCode === 38) {
            console.log('up');
            Tree.selectPreviousNode(tree);
            Render(tree);
            return false;
        } else if (e.keyCode === 39) {
            console.log('right');
            return false;
        } else if (e.keyCode === 40) {
            console.log('down');
            Tree.selectNextNode(tree);
            Render(tree);
            console.log('tree now', tree);
            return false;
        } else if (e.keyCode === 13) {
            return false;
        }
    });
    testTree(Tree);
});





var testTree = function(Tree) {
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
        selected = Tree.findSelected(Tree.makeTree(tree));
        next = Tree.findNextNode(selected);
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
        selected = Tree.findSelected(Tree.makeTree(treeNext));
        next = Tree.findNextNode(selected);
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
        selected = Tree.findSelected(Tree.makeTree(treeNext2));
        next = Tree.findNextNode(selected);
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
        selected = Tree.findSelected(Tree.makeTree(treeNext3));
        next = Tree.findNextNode(selected);
        console.assert(selected.title === 'cherry');
        console.assert(next === null);
    };

    var testSelectNextNode = function() {
        var tree = Tree.makeTree({
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

        var treeNext = Tree.makeTree({
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
        Tree.selectNextNode(tree);
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
        selected = Tree.findSelected(Tree.makeTree(tree));
        next = Tree.findPreviousNode(selected);
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
        selected = Tree.findSelected(Tree.makeTree(treeNext));
        next = Tree.findPreviousNode(selected);
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
        selected = Tree.findSelected(Tree.makeTree(treeNext2));
        next = Tree.findPreviousNode(selected);
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
        selected = Tree.findSelected(Tree.makeTree(treeNext3));
        next = Tree.findPreviousNode(selected);
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
        var tree = Tree.makeTree(treeNext2).childNodes[1].childNodes[0].childNodes[0];
        console.log('tree tester', tree);
        var next = Tree.findNextNode(tree);
        console.log('NEXT', next);
    }
    testSelectAndNext();
    testSelectAndNextReverse();
    testSelectNextNode();
}
