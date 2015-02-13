define(function (require) {
    var Tree = require('tree');
    var _ = require('underscore');
    var $ = require('jquery');
    var React = require('react');
    var TreeNode = require('jsx!app/all');

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

    var renderAll = function() {
        React.renderComponent(
          <TreeNode node={tree} />,
          document.getElementById("tree")
        );
    };
    renderAll();
    $('#tree').keydown(function(e) {
        if (e.keyCode === 37) {
            console.log('left');
            return false;
        } else if (e.keyCode === 38) {
            console.log('up');
            Tree.selectPreviousNode(tree);
            renderAll();
            return false;
        } else if (e.keyCode === 39) {
            console.log('right');
            return false;
        } else if (e.keyCode === 40) {
            console.log('down');
            Tree.selectNextNode(tree);
            renderAll();
            console.log('tree now', tree);
            return false;
        } else if (e.keyCode === 13) {
            return false;
        }
    });
});

