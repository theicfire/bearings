var assert = require("assert");
var _ = require("underscore");
var Tree = require('../lib/Tree');
var multiline = require('multiline');
var yaml = require('js-yaml');

it('Tree.search', function(){
var startYaml = multiline(function(){/*
---
- hi
- there
- 
    - {title: needle, selected: true}
    - neat also has needle
    - does not have the search term
    - parent without the search term
    -
        - more
        - children and needle
*/});
    var startTree = Tree.makeTree(Tree.yamlObjToTree(yaml.safeLoad(startYaml)));
var searchYaml = multiline(function(){/*
---
- there
- 
    - needle
    - neat also has needle
    - parent without the search term
    -
        - children and needle
*/});
    var searchTree = Tree.makeTree(Tree.yamlObjToTree(yaml.safeLoad(searchYaml)));
    assert(Tree.equals(Tree.search(startTree, 'needle'), searchTree));
});

