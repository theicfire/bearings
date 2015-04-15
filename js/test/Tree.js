var assert = require("assert");
var _ = require("underscore");
var Tree = require('../lib/Tree');
var multiline = require('multiline');

it('toString and fromString should be opposites', function(){
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
    assert.equal(Tree.toString(tree), Tree.toString(Tree.fromString(Tree.toString(tree))));
});

it('Node should not be removed if backspace is pressed at the beginning of a line and there is no sibling above the line', function(){
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
    assert.equal(Tree.toString(tree), Tree.toString(newTree));
});

it('If there is a sibling above the current line and backspace is pressed at the beginning of the line, we delete the line and combine the two.', function() {
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
    assert(Tree.equals(tree, newTree));
});

it('clone', function() {
    var tree = Tree.makeTree([
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: 'dog', selected: true, caretLoc: 0}
              ]},
              {title: "cherry"}
          ]}]);
    assert(Tree.equals(tree, Tree.clone(tree)));
});

describe('indent', function() {
    it('one', function() {
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
        assert(Tree.equals(tree, nextTree));
    });

    it('two', function() {
        var tree = Tree.makeTree([
            {title: "suzie", childNodes: [
                    {title: "puppy", childNodes: [
                            {title: 'dog', selected: true, caretLoc: 0}
                        ]},
                    {title: "cherry"}
                ]}]);

        // No change
        var nextTree = Tree.makeTree([
            {title: "suzie", childNodes: [
                    {title: "puppy", childNodes: [
                            {title: 'dog', selected: true, caretLoc: 0}
                        ]},
                    {title: "cherry"}
                ]}]);
        Tree.indent(tree);
        assert(Tree.equals(tree, nextTree));
    });
});

describe('newLineAtCursor', function() {
    it('one', function() {
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
        assert(Tree.equals(tree, newTree));
    });

    it('two', function() {
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
        assert(Tree.equals(tree, newTree));
    });

    it('three', function() {
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
        assert(Tree.equals(tree, newTree));
    });
});

describe('findSelected and findNextNode', function() {
    it('Sibling below you should be the next selection if you have no children', function() {
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
        assert.equal(selected.title, 'bobby');
        assert.equal(next.title, 'suzie');
    });

    it('If you have children, the first child should be selected in findNextNode', function() {
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
        assert.equal(selected.title, 'suzie');
        assert.equal(next.title, 'puppy');
    });

    it('If you have no sibling, your parent\'s lower sibling should be selected', function() {
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
        assert.equal(selected.title, 'dog');
        assert.equal(next.title, 'cherry');
    });

    it('If you are the last element, there is no other next element to select', function() {
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
        assert.equal(selected.title, 'cherry');
        assert.equal(next, null);
    });
});

describe('Looking for the previous node of some selected node (findPreviousNode)', function() {
    it('If you have no siblings above you, the previous node is the parent', function() {
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
        assert.equal(selected.title, 'bobby');
        assert.equal(next.title, 'howdy');
    });

    it('If you have a sibling above you, that is the previous node', function() {
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
        assert.equal(selected.title, 'suzie');
        assert.equal(next.title, 'bobby');
    });

    // TODO this is not symetric with getNextNode. getNextNode never returns null.
    it('If there are no siblings above you and you have no parent, the previous node is... null', function() {
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
        assert.equal(selected.title, 'howdy');
        assert.equal(next, null);
    });

    it('four', function() {
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
        assert.equal(selected.title, 'cherry');
        assert.equal(next.title, 'dog');
    });
});

it('testSelectNext', function() {
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
    assert.equal(next.title, 'cherry');
});

it('testPath', function() {
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
    assert.equal(Tree.getPath(innerTree), '-0-1-0-0');
    assert.equal(Tree.getPath(innerTree2), '-0');
});

describe('deleteSelected', function() {
    it('deleting an item with children should kill the children', function() {
        var tree = Tree.fromString(multiline(function(){/*
        {
            "title": "special_root_title",
            "childNodes": [
                {
                    "title": "howdy",
                    "childNodes": [
                        {
                            "title": "billy"
                        },
                        {
                            "title": "suzie",
                            "childNodes": [
                                {
                                    "title": "cherry thing"
                                }
                            ]
                        }
                    ],
                    "selected": true
                },
                {
                    "title": "the end"
                }
            ]
        }
        */}));

        var after = Tree.fromString(multiline(function() {/*
        {
            "title": "special_root_title",
            "childNodes": [
                {
                    "title": "the end",
                    "selected": true
                }
            ]
        }
        */}));

        Tree.deleteSelected(tree);
        assert.equal(Tree.toStringClean(tree), Tree.toStringClean(after));
    });

    it('deleting the last item works', function() {
        var tree = Tree.fromString(multiline(function(){/*
        {
            "title": "special_root_title",
            "childNodes": [
                {
                    "title": "howdy",
                    "childNodes": [
                        {
                            "title": "billy"
                        }
                    ]
                },
                {
                    "title": "the end",
                    "selected": true
                }
            ]
        }

        */}));

        var after = Tree.fromString(multiline(function(){/*
        {
            "title": "special_root_title",
            "childNodes": [
                {
                    "title": "howdy",
                    "childNodes": [
                        {
                            "title": "billy",
                            "selected": true
                        }
                    ]
                }
            ]
        }
        */}));
        Tree.deleteSelected(tree);
        assert.equal(Tree.toStringClean(tree), Tree.toStringClean(after));
    });
});

describe('shiftUp', function() {
    it('regular', function() {
        var before = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "howdy"
        },
        {
            "title": "billy",
            "selected": true
        }
    ]
}
        */}));

        var after = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "billy",
            "selected": true
        },
        {
            "title": "howdy"
        }
    ]
}
        */}));
        Tree.shiftUp(before);

        assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
    });
    it('moving an item up that\'s already at the top does nothing', function() {
        var before = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "billy",
            "selected": true
        },
        {
            "title": "howdy"
        }
    ]
}
        */}));

        var after = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "billy",
            "selected": true
        },
        {
            "title": "howdy"
        }
    ]
}
        */}));
        Tree.shiftUp(before);

        assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
    });
    it('Moving a single child up does nothing', function() {
        var before = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "billy",
            "childNodes": [
                {
                    "title": "cool child",
                    "selected": true
                }
            ]
        },
        {
            "title": "howdy"
        }
    ]
}
        */}));

        var after = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "billy",
            "childNodes": [
                {
                    "title": "cool child",
                    "selected": true
                }
            ]
        },
        {
            "title": "howdy"
        }
    ]
}
        */}));
        Tree.shiftUp(before);

        assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
    });
    it('Shifting up over items with children', function() {
        var before = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "billy",
            "childNodes": [
                {
                    "title": "cool child"
                }
            ]
        },
        {
            "title": "howdy",
            "selected": true
        }
    ]
}
        */}));

        var after = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "howdy",
            "selected": true
        },
        {
            "title": "billy",
            "childNodes": [
                {
                    "title": "cool child"
                }
            ]
        }
    ]
}
        */}));
        Tree.shiftUp(before);

        assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
    });
});

describe('shiftDown', function() {
    it('regular', function() {
        var before = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "billy",
            "selected": true
        },
        {
            "title": "howdy"
        }
    ]
}
        */}));

        var after = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "howdy"
        },
        {
            "title": "billy",
            "selected": true
        }
    ]
}
        */}));
        Tree.shiftDown(before);

        assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
    });
});


describe('selectPreviousNode', function() {
    it('regular', function() {
        var before = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "howdy"
        },
        {
            "title": "billy",
            "selected": true
        }
    ]
}
        */}));

        var after = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "howdy",
            "selected": true
        },
        {
            "title": "billy"
        }
    ]
}
        */}));
        Tree.selectPreviousNode(before);
        assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));

        // Doesn't change the second time
        Tree.selectPreviousNode(before);
        assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
    });
});


describe('selectNextNode', function() {
    it('If you have a child, that is the next node', function() {
        var before = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two"
                },
                {
                    "title": "three"
                }
            ],
            "selected": true
        },
        {
            "title": "four"
        }
    ],
    "zoomPath": ""
}
        */}));

        var after = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "selected": true
                },
                {
                    "title": "three"
                }
            ]
        },
        {
            "title": "four"
        }
    ],
    "zoomPath": ""
}
        */}));
        Tree.selectNextNode(before);
        assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
    });
    it('If you have no children and a sibling, that is the next node', function() {
        var before = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "selected": true
                },
                {
                    "title": "three"
                }
            ]
        },
        {
            "title": "four"
        }
    ],
    "zoomPath": ""
}
        */}));

        var after = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two"
                },
                {
                    "title": "three",
                    "selected": true
                }
            ]
        },
        {
            "title": "four"
        }
    ],
    "zoomPath": ""
}
        */}));
        Tree.selectNextNode(before);
        assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
    });

    it('If you are zoomed in and are at the bottom of your view, do not select the next node', function() {
        var before = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two"
                },
                {
                    "title": "three",
                    "selected": true
                }
            ]
        },
        {
            "title": "four"
        }
    ],
    "zoomPath": "-0"
}
        */}));

        var after = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two"
                },
                {
                    "title": "three",
                    "selected": true
                }
            ]
        },
        {
            "title": "four"
        }
    ],
    "zoomPath": "-0"
}
        */}));
        Tree.selectNextNode(before);
        assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
    });
});

describe('selectLastNode', function() {
    it('When zoomed in, the last node should be the last node of the zoomed in view', function() {
        var before = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "selected": true
                },
                {
                    "title": "three"
                }
            ]
        },
        {
            "title": "four"
        }
    ],
    "zoomPath": "-0"
}
        */}));

        var after = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two"
                },
                {
                    "title": "three",
                    "selected": true
                }
            ]
        },
        {
            "title": "four"
        }
    ],
    "zoomPath": "-0"
}
        */}));
        Tree.selectLastNode(before);
        assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
    });
});

describe('selectFirstNode', function() {
    it('First node is the first node up, up to the zoom level', function() {
        var before = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "childNodes": [
                        {
                            "title": "three",
                            "selected": true
                        }
                    ]
                }
            ]
        }
    ],
    "zoomPath": "-0-0"
}
        */}));

        var after = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "childNodes": [
                        {
                            "title": "three"
                        }
                    ],
                    "selected": true
                }
            ]
        }
    ],
    "zoomPath": "-0-0"
}
        */}));
        Tree.selectFirstNode(before);
        assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
    });
});

describe('unindent', function() {
    it('Do not unindent outside of your current zoom', function() {
        var before = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "selected": true
                }
            ]
        }
    ],
    "zoomPath": "-0"
}
        */}));

        var after = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "selected": true
                }
            ]
        }
    ],
    "zoomPath": "-0"
}
        */}));
        Tree.unindent(before);
        assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
    });
});


describe('breadcrumb', function() {
    it('regular', function() {
        var tree = Tree.fromString(multiline(function(){/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "childNodes": [
                        {
                            "title": "three",
                            "selected": true
                        }
                    ]
                }
            ]
        }
    ],
    "zoomPath": "-0-0-0"
}
        */}));

        var root = tree;
        assert.deepEqual(Tree.getBreadcrumb(root), ['Home', 'one', 'two']);
    });
});
