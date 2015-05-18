var assert = require("assert");
var _ = require("underscore");
var Tree = require('../lib/Tree');
var multiline = require('multiline');

Tree.generateUUID = function() {return '1'};
it('toString and fromString should be opposites', function(){
    var startTree =
      [{title: "howdy", selected: "true",
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
            {title: 'dog', selected: true,}
          ]},
          {title: "cherry"}
      ]}]);
    var newTree = Tree.makeTree([
        {title: "suzie", childNodes: [
          {title: "puppy", childNodes: [
            {title: 'dog', selected: true,}
          ]},
          {title: "cherry"}
      ]}]);
    Tree.backspaceAtBeginning(tree, {caretLoc: 0});
    assert.equal(Tree.toString(tree), Tree.toString(newTree));
});

it('If there is a sibling above the current line and backspace is pressed at the beginning of the line, we delete the line and combine the two.', function() {
    var tree;
    tree = Tree.makeTree([
        {title: "suzie", childNodes: [
                {title: "puppy"},
                {title: "cherry", selected: true}
      ]}]);
    var newTree = Tree.makeTree([
        {title: "suzie", childNodes: [
                {title: "puppycherry", selected: true}
      ]}]);
    var localState = {caretLoc: 0};
    Tree.backspaceAtBeginning(tree, localState);
    assert(Tree.equals(tree, newTree));
    assert(localState.caretLoc === 5);
});

it('clone', function() {
    var tree = Tree.makeTree([
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: 'dog', selected: true}
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
                    {title: "cherry", selected: true}
                ]}]);

        var nextTree = Tree.makeTree([
            {title: "suzie", childNodes: [
                    {title: "puppy", childNodes: [
                            {title: 'dog'},
                            {title: "cherry", selected: true}
                        ]},
                ]}]);
        Tree.indent(tree);
        assert(Tree.equals(tree, nextTree));
    });

    it('two', function() {
        var tree = Tree.makeTree([
            {title: "suzie", childNodes: [
                    {title: "puppy", childNodes: [
                            {title: 'dog', selected: true}
                        ]},
                    {title: "cherry"}
                ]}]);

        // No change
        var nextTree = Tree.makeTree([
            {title: "suzie", childNodes: [
                    {title: "puppy", childNodes: [
                            {title: 'dog', selected: true}
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
                {title: someTitle, selected: true}
              ]},
              {title: "cherry"}
          ]}]);
        newTree = Tree.makeTree([
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: someTitle},
                {title: "", selected: true}
              ]},
              {title: "cherry"}
          ]}]);
        var localState = {caretLoc: someTitle.length};
        Tree.newLineAtCursor(tree, localState);
        assert(Tree.equals(tree, newTree));
        assert(localState.caretLoc === 0);
    });

    it('two', function() {
        var tree;
        var someTitle = 'dog';
        tree = Tree.makeTree([
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: someTitle, selected: true}
              ]},
              {title: "cherry"}
          ]}]);
        newTree = Tree.makeTree([
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: "", selected: true},
                {title: someTitle}
              ]},
              {title: "cherry"}
          ]}]);
        var localState = {caretLoc: 0};
        Tree.newLineAtCursor(tree, localState);
        assert(Tree.equals(tree, newTree));
        assert(localState.caretLoc === 0);
    });

    it('three', function() {
        var tree;
        var someTitle = 'dog';
        tree = Tree.makeTree([
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: someTitle, selected: true}
              ]},
              {title: "cherry"}
          ]}]);
        newTree = Tree.makeTree([
            {title: "suzie", childNodes: [
              {title: "puppy", childNodes: [
                {title: 'd'},
                {title: 'og', selected: true}
              ]},
              {title: "cherry"}
          ]}]);
        var localState = {caretLoc: 1};
        Tree.newLineAtCursor(tree, localState);
        assert(Tree.equals(tree, newTree));
        assert(localState.caretLoc === 0);
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

        Tree.deleteSelected(tree, {caretLoc: 0});
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
        Tree.deleteSelected(tree, {caretLoc: 0});
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
                    "title": "two",
                    "uuid": "8f62b509-cb07-4812-9cb0-7a61feeb4aec"
                },
                {
                    "title": "three",
                    "selected": true,
                    "uuid": "0c299b0f-f79a-4a7b-8f53-18a9bfacdcfe"
                }
            ],
            "uuid": "76406524-3bee-4a12-8423-83421d964b25"
        },
        {
            "title": "four",
            "uuid": "b7e0cadd-8cad-454e-a1ac-72b9c20f5b8a"
        }
    ],
    "completedHidden": true,
    "uuid": "0703016f-cdc1-4a09-b311-29c120b56ca0",
    "zoomUUID": "76406524-3bee-4a12-8423-83421d964b25"
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
                    "uuid": "8f62b509-cb07-4812-9cb0-7a61feeb4aec"
                },
                {
                    "title": "three",
                    "selected": true,
                    "uuid": "0c299b0f-f79a-4a7b-8f53-18a9bfacdcfe"
                }
            ],
            "uuid": "76406524-3bee-4a12-8423-83421d964b25"
        },
        {
            "title": "four",
            "uuid": "b7e0cadd-8cad-454e-a1ac-72b9c20f5b8a"
        }
    ],
    "completedHidden": true,
    "uuid": "0703016f-cdc1-4a09-b311-29c120b56ca0",
    "zoomUUID": "76406524-3bee-4a12-8423-83421d964b25"
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
                    "selected": true,
                    "uuid": "9f033584-4f61-4f49-9ad5-1acbc2201a12"
                },
                {
                    "title": "three",
                    "uuid": "bdda8a40-f554-4dfd-aa37-229d6f7c45c9"
                }
            ],
            "uuid": "8e1ad1f7-88f0-413d-85f1-576dd42d8244"
        },
        {
            "title": "four",
            "uuid": "08dfd68b-0491-402c-b762-e2d37c8e14c0"
        }
    ],
    "completedHidden": true,
    "uuid": "263116c9-ffda-4597-837f-4df94fc8bc98",
    "zoomUUID": "8e1ad1f7-88f0-413d-85f1-576dd42d8244"
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
                    "uuid": "9f033584-4f61-4f49-9ad5-1acbc2201a12"
                },
                {
                    "title": "three",
                    "selected": true,
                    "uuid": "bdda8a40-f554-4dfd-aa37-229d6f7c45c9"
                }
            ],
            "uuid": "8e1ad1f7-88f0-413d-85f1-576dd42d8244"
        },
        {
            "title": "four",
            "uuid": "08dfd68b-0491-402c-b762-e2d37c8e14c0"
        }
    ],
    "completedHidden": true,
    "uuid": "263116c9-ffda-4597-837f-4df94fc8bc98",
    "zoomUUID": "8e1ad1f7-88f0-413d-85f1-576dd42d8244"
}
        */}));
        Tree.selectLastNode(before, {caretLoc: 0});
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
                            "selected": true,
                            "uuid": "bdda8a40-f554-4dfd-aa37-229d6f7c45c9"
                        }
                    ],
                    "uuid": "9f033584-4f61-4f49-9ad5-1acbc2201a12"
                }
            ],
            "uuid": "8e1ad1f7-88f0-413d-85f1-576dd42d8244"
        }
    ],
    "completedHidden": true,
    "uuid": "263116c9-ffda-4597-837f-4df94fc8bc98",
    "zoomUUID": "9f033584-4f61-4f49-9ad5-1acbc2201a12"
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
                            "title": "three",
                            "uuid": "bdda8a40-f554-4dfd-aa37-229d6f7c45c9"
                        }
                    ],
                    "selected": true,
                    "uuid": "9f033584-4f61-4f49-9ad5-1acbc2201a12"
                }
            ],
            "uuid": "8e1ad1f7-88f0-413d-85f1-576dd42d8244"
        }
    ],
    "completedHidden": true,
    "uuid": "263116c9-ffda-4597-837f-4df94fc8bc98",
    "zoomUUID": "9f033584-4f61-4f49-9ad5-1acbc2201a12"
}
        */}));
        Tree.selectFirstNode(before, {caretLoc: 0});
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
                    "selected": true,
                    "uuid": "9f033584-4f61-4f49-9ad5-1acbc2201a12"
                }
            ],
            "uuid": "8e1ad1f7-88f0-413d-85f1-576dd42d8244"
        }
    ],
    "completedHidden": true,
    "uuid": "263116c9-ffda-4597-837f-4df94fc8bc98",
    "zoomUUID": "8e1ad1f7-88f0-413d-85f1-576dd42d8244"
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
                    "selected": true,
                    "uuid": "9f033584-4f61-4f49-9ad5-1acbc2201a12"
                }
            ],
            "uuid": "8e1ad1f7-88f0-413d-85f1-576dd42d8244"
        }
    ],
    "completedHidden": true,
    "uuid": "263116c9-ffda-4597-837f-4df94fc8bc98",
    "zoomUUID": "8e1ad1f7-88f0-413d-85f1-576dd42d8244"
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
                            "selected": true,
                            "uuid": "527127c4-2143-4e55-95e9-b39c9625fbb7"
                        }
                    ],
                    "uuid": "7aba66e3-7fc8-46be-a856-6d85a575e4ef"
                }
            ],
            "uuid": "62cfae37-c3d8-40f8-bd2f-3ef979ed8ddf"
        }
    ],
    "completedHidden": true,
    "uuid": "03f56f45-19a3-4f90-857f-7b4a5f169d05",
    "zoomUUID": "527127c4-2143-4e55-95e9-b39c9625fbb7"
}
        */}));

        var root = tree;
        assert.deepEqual(Tree.getBreadcrumb(root), ['Home', 'one', 'two']);
    });
});
