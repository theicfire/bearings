define(function (require) {
    var Tree = require('tree');
    var _ = require('underscore');
    var $ = require('jquery');
    var React = require('react');
    var Render = require('jsx!app/TreeNode');

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

    var selected = Tree.findSelected(tree);
    selected.caretLoc = 0;

    Render(tree);
    $('#tree').keydown(function(e) {
        if (e.keyCode === 37) {
            console.log('left');
            //var caretLoc = getCaretCharacterOffsetWithin(document.activeElement);
            //selected.caretLoc = caretLoc;
            //console.log('moved cursor', caretLoc);
        } else if (e.keyCode === 38) {
            console.log('up');
            Tree.selectPreviousNode(tree);
            selected = Tree.findSelected(tree);
            selected.caretLoc = 0;
            Render(tree);
            return false;
        } else if (e.keyCode === 39) {
            console.log('right');
            //var caretLoc = getCaretCharacterOffsetWithin(document.activeElement);
            //selected.caretLoc = caretLoc;
            //console.log('moved cursor', caretLoc);
        } else if (e.keyCode === 40) {
            console.log('down');
            Tree.selectNextNode(tree);
            selected = Tree.findSelected(tree);
            selected.caretLoc = 0;
            Render(tree);
            console.log('tree now', tree);
            return false;
        } else if (e.keyCode === 13) {
            var caretLoc = getCaretCharacterOffsetWithin(document.activeElement);
            selected.caretLoc = caretLoc;
            console.log('loc', selected.caretLoc);
            Tree.newLineAtCursor(tree);
            selected = Tree.findSelected(tree);
            Render(tree);
            return false;
        } else {
        }
    });
    $('#tree').keyup(function(e) {
        selected.title = document.activeElement.innerHTML;
    });
    testTree(Tree);
});

function getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

var testAddChild = function(Tree) {
    (function() {
        var tree;
        var someTitle = 'dog';
        tree = Tree.makeTree(
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: someTitle, selected: true, caretLoc: someTitle.length}
              ]},
              {title: "cherry"}
          ]});
        newTree = Tree.makeTree(
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: someTitle},
                {title: "", selected: true, caretLoc: 0}
              ]},
              {title: "cherry"}
          ]});
        Tree.newLineAtCursor(tree);
        console.assert(_.isEqual(tree, newTree));
    })();

    (function() {
        var tree;
        var someTitle = 'dog';
        tree = Tree.makeTree(
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: someTitle, selected: true, caretLoc: 0}
              ]},
              {title: "cherry"}
          ]});
        newTree = Tree.makeTree(
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: "", selected: true, caretLoc: 0},
                {title: someTitle}
              ]},
              {title: "cherry"}
          ]});
        Tree.newLineAtCursor(tree);
        console.assert(_.isEqual(tree, newTree));
    })();

    (function() {
        var tree;
        var someTitle = 'dog';
        tree = Tree.makeTree(
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: someTitle, selected: true, caretLoc: 1}
              ]},
              {title: "cherry"}
          ]});
        newTree = Tree.makeTree(
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: 'd'},
                {title: 'og', selected: true, caretLoc: 0}
              ]},
              {title: "cherry"}
          ]});
        Tree.newLineAtCursor(tree);
        console.assert(_.isEqual(tree, newTree));
    })();
};

var testSelectAndNext = function(Tree) {
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

var testSelectNextNode = function(Tree) {
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

var testSelectNext = function(Tree) {
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
    var next = Tree.findNextNode(tree);
};
var testTree = function(Tree) {
    testSelectAndNext(Tree);
    testSelectAndNextReverse(Tree);
    testSelectNextNode(Tree);
    testAddChild(Tree);
}
