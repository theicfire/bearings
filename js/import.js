var React = require('react/addons');
var opmlToJSON = require('opml-to-json');
var multiline = require('multiline');
var Tree = require('./lib/Tree');
var Parse = require('parse').Parse;

Parse.initialize("R7ngCzUNFlUFW2jZO90HfG7Pgr8Roa0dgIsFknNJ", "hvTrWozZrInn3qmEuE2zlscYBNRwUWjkndcIwIOL");
var TestObject = Parse.Object.extend("TestObject");
var query = new Parse.Query(TestObject);

var SubmitButton = React.createClass({
    getInitialState: function() {
        return {value: ''};
    },
    render: function() {
      var value = this.state.value;
        return (<div>
      <div><textarea id="text" onChange={this.handleChange} rows="20" cols="100"></textarea></div>
        <button value={value} onClick={this.handleClick}>Import!</button>
      </div>
        );
    },
    handleClick: function(e) {
        console.log('clicked', this.state.value);
    },
    handleChange: function(event) {
        this.setState({value: event.target.value});
    }
});

var workflowyToWorkclone = function(tree) {
    var ret = workflowyToWorkcloneRec(tree);
    ret.childNodes[0].selected = true;
    return ret.childNodes;
};

var workflowyToWorkcloneRec = function(tree) {
    var ret = {title: tree.title !== undefined ? tree.title : tree.text};
    if (!tree.children) {
        return ret;
    }
    ret.childNodes = [];
    for (var i = 0; i < tree.children.length; i++) {
        ret.childNodes.push(workflowyToWorkcloneRec(tree.children[i]));
    }
    return ret;
};

var rawStartTree =
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

var opml = multiline(function(){/*
    <?xml version="1.0"?>
    <opml version="2.0">
      <head>
        <ownerEmail>theicfire@gmail.com</ownerEmail>
      </head>
      <body>
        <outline text="Reading speed" >
          <outline text="code name ginger" >
            <outline text="feb 26: 30 pages, 48 minutes" /></outline>
            <outline text="next thing" /></outline>
        </outline>
        <outline text="other" >
        </outline>
      </body>
    </opml>
*/});

React.render(
      <SubmitButton />
    , document.getElementById('all'));

query.get("qJbAFzSI53", {
    success: function (parseTree) {
        opmlToJSON(opml, function (error, json) {
            var tree = Tree.makeTree(workflowyToWorkclone(json));
            console.log('tree', Tree.toString(tree));
            parseTree.set('tree', Tree.toString(tree));
            parseTree.save();
        });
    },
    error: function(obj, error) {
        throw('Error loading tree' + obj + error);
    }
});
