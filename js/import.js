var React = require('react/addons');
var cheerio = require('cheerio');
var opmlToJSON = require('opml-to-json');
var multiline = require('multiline');
var Tree = require('./lib/Tree');
var Convert = require('./lib/Convert');
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
        <button value={value} onClick={this.handleClick}>Import opml</button>
        <button value={value} onClick={this.handleHtmlClick}>Import html</button>
      </div>
        );
    },
    handleClick: function(e) {
        console.log('clicked', this.state.value);
        submitOpml(this.state.value);
    },
    handleHtmlClick: function(e) {
        var tree = Tree.makeTree(Convert.htmlToTree(this.state.value));
        query.get("qJbAFzSI53", {
            success: function (parseTree) {
                console.log('Saving tree', Tree.toString(tree));
                parseTree.set('tree', Tree.toString(tree));
                parseTree.save();
            },
            error: function(obj, error) {
                throw('Error loading tree' + obj + error);
            }
        });
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

var sampleOpml = multiline(function(){/*
    <?xml version="1.0"?>
    <opml version="2.0">
      <head>
        <ownerEmail>theicfire@gmail.com</ownerEmail>
      </head>
      <body>
        <outline text="one" >
          <outline text="two" >
            <outline text="three" /></outline>
            <outline text="four" /></outline>
        </outline>
        <outline text="five" >
        </outline>
      </body>
    </opml>
*/});

var sampleHtml = multiline(function(){/*
<meta http-equiv="content-type" content="text/html; charset=utf-8">
<ul style="margin: 15px 0px 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; list-style: disc; color: rgb(51, 51, 51); font-family: 'Helvetica Neue', Arial, sans-serif; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 17px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 1; word-spacing: 0px; -webkit-text-stroke-width: 0px; background: transparent;">
   <li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;">
      <span class="name" data-wfid="e3ea4e756ce1" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">one</span>
      <ul style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; list-style: disc; background: transparent;">
         <li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;"><span class="name" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">two</span></li>
         <li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;">
            <span class="name" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">three</span>
            <ul style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; list-style: disc; background: transparent;">
               <li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;">
                  <span class="name" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">four</span>
                  <ul style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; list-style: disc; background: transparent;">
                     <li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;"><span class="name" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">five</span></li>
                  </ul>
               </li>
            </ul>
         </li>
      </ul>
   </li>
</ul>
*/});

$ = cheerio.load(sampleHtml);
//console.log($('span').eq(0));
console.log(JSON.stringify(printAll($('ul').eq(0)), null, '   '));


React.render(
      <SubmitButton />
    , document.getElementById('all'));

function printAll(objs) {
    var ret = [];
    objs.each(function(i, el) {
        //console.log('name', el.name, 'type', el.type);
        if (el.name === 'span') {
            ret.push($(this).text());
        } else {
            //console.log('el', $(this));
            ret.push(printAll($(this).children()));
        }
    });
    return ret;
}

function submitOpml(opml) {
    console.log('submit', opml);
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
}

