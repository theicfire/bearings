var assert = require('assert');
var _ = require('underscore');
var Tree = require('../lib/Tree');
var multiline = require('multiline');

Tree.generateUUID = function() {
	return '1';
};
it('toString and fromString should be opposites', function() {
	var startTree = [
		{
			title: 'howdy',
			childNodes: [
				{ title: 'billy' },
				{
					title: 'suzie',
					childNodes: [
						{
							title: 'puppy',
							childNodes: [{ title: 'dog house' }]
						},
						{ title: 'cherry thing' }
					]
				}
			]
		}
	];

	var tree = Tree.makeTree(startTree);
	assert.equal(
		Tree.toString(tree),
		Tree.toString(Tree.fromString(Tree.toString(tree)))
	);
});

it('Node should not be removed if backspace is pressed at the beginning of a line and there is no sibling above the line', function() {
	var tree = Tree.fromString(
		multiline(function() {
			/*
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
                            "uuid": "bab9cb24-f5f0-49f5-bde1-9103a33a1939"
                        }
                    ],
                    "uuid": "204dc0c4-6a8b-45c7-924b-0f87ee7d2854"
                }
            ],
            "uuid": "a6ddf085-a7d9-4ea0-bb47-dbe71a3a595c"
        }
    ],
    "selected": "bab9cb24-f5f0-49f5-bde1-9103a33a1939",
    "completedHidden": true,
    "caretLoc": 5,
    "uuid": "8fb219be-71c2-454d-97de-bd745c277e1e",
    "zoomUUID": "8fb219be-71c2-454d-97de-bd745c277e1e"
}
        */
		})
	);

	var after = Tree.fromString(
		multiline(function() {
			/*
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
                            "uuid": "bab9cb24-f5f0-49f5-bde1-9103a33a1939"
                        }
                    ],
                    "uuid": "204dc0c4-6a8b-45c7-924b-0f87ee7d2854"
                }
            ],
            "uuid": "a6ddf085-a7d9-4ea0-bb47-dbe71a3a595c"
        }
    ],
    "selected": "bab9cb24-f5f0-49f5-bde1-9103a33a1939",
    "completedHidden": true,
    "caretLoc": 5,
    "uuid": "8fb219be-71c2-454d-97de-bd745c277e1e",
    "zoomUUID": "8fb219be-71c2-454d-97de-bd745c277e1e"
}
        */
		})
	);

	Tree.backspaceAtBeginning(tree);
	assert.equal(Tree.toStringClean(tree), Tree.toStringClean(after));
});

it('If there is a sibling above the current line and backspace is pressed at the beginning of the line, we delete the line and combine the two.', function() {
	var tree = Tree.fromString(
		multiline(function() {
			/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "204dc0c4-6a8b-45c7-924b-0f87ee7d2854"
                },
                {
                    "title": "three",
                    "uuid": "1d5ab0d9-94c5-4ed9-bd5e-0721c8b51c44"
                }
            ],
            "uuid": "a6ddf085-a7d9-4ea0-bb47-dbe71a3a595c"
        }
    ],
    "selected": "1d5ab0d9-94c5-4ed9-bd5e-0721c8b51c44",
    "completedHidden": true,
    "caretLoc": 5,
    "uuid": "8fb219be-71c2-454d-97de-bd745c277e1e",
    "zoomUUID": "8fb219be-71c2-454d-97de-bd745c277e1e"
}
        */
		})
	);

	var after = Tree.fromString(
		multiline(function() {
			/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "twothree",
                    "uuid": "204dc0c4-6a8b-45c7-924b-0f87ee7d2854"
                }
            ],
            "uuid": "a6ddf085-a7d9-4ea0-bb47-dbe71a3a595c"
        }
    ],
    "selected": "204dc0c4-6a8b-45c7-924b-0f87ee7d2854",
    "completedHidden": true,
    "caretLoc": 3,
    "uuid": "8fb219be-71c2-454d-97de-bd745c277e1e",
    "zoomUUID": "8fb219be-71c2-454d-97de-bd745c277e1e"
}
        */
		})
	);

	Tree.backspaceAtBeginning(tree);
	assert.equal(Tree.toStringClean(tree), Tree.toStringClean(after));
});

it('clone', function() {
	var tree = Tree.makeTree([
		{
			title: 'suzie',
			childNodes: [
				{
					title: 'puppy',
					childNodes: [{ title: 'dog', selected: true }]
				},
				{ title: 'cherry' }
			]
		}
	]);
	assert(Tree.equals(tree, Tree.clone(tree)));
});

describe('indent', function() {
	it('one', function() {
		var tree = Tree.fromString(
			multiline(function() {
				/*
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
                            "uuid": "5ed5f33d-f451-4e75-84aa-fa0672b5feb6"
                        }
                    ],
                    "uuid": "204dc0c4-6a8b-45c7-924b-0f87ee7d2854"
                },
                {
                    "title": "four",
                    "uuid": "4ffc823c-bb9d-44cb-99ac-92c4c7cb5faf"
                }
            ],
            "uuid": "a6ddf085-a7d9-4ea0-bb47-dbe71a3a595c"
        }
    ],
    "selected": "4ffc823c-bb9d-44cb-99ac-92c4c7cb5faf",
    "completedHidden": true,
    "caretLoc": 4,
    "uuid": "8fb219be-71c2-454d-97de-bd745c277e1e",
    "zoomUUID": "8fb219be-71c2-454d-97de-bd745c277e1e"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
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
                            "uuid": "5ed5f33d-f451-4e75-84aa-fa0672b5feb6"
                        },
                        {
                            "title": "four",
                            "uuid": "4ffc823c-bb9d-44cb-99ac-92c4c7cb5faf"
                        }
                    ],
                    "uuid": "204dc0c4-6a8b-45c7-924b-0f87ee7d2854"
                }
            ],
            "uuid": "a6ddf085-a7d9-4ea0-bb47-dbe71a3a595c"
        }
    ],
    "selected": "4ffc823c-bb9d-44cb-99ac-92c4c7cb5faf",
    "completedHidden": true,
    "caretLoc": 4,
    "uuid": "8fb219be-71c2-454d-97de-bd745c277e1e",
    "zoomUUID": "8fb219be-71c2-454d-97de-bd745c277e1e"
}
        */
			})
		);

		Tree.indent(tree);
		assert.equal(Tree.toStringClean(tree), Tree.toStringClean(after));
	});

	it('two', function() {
		var tree = Tree.fromString(
			multiline(function() {
				/*
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
                            "uuid": "5ed5f33d-f451-4e75-84aa-fa0672b5feb6"
                        }
                    ],
                    "uuid": "204dc0c4-6a8b-45c7-924b-0f87ee7d2854"
                },
                {
                    "title": "four",
                    "uuid": "4ffc823c-bb9d-44cb-99ac-92c4c7cb5faf"
                }
            ],
            "uuid": "a6ddf085-a7d9-4ea0-bb47-dbe71a3a595c"
        }
    ],
    "selected": "5ed5f33d-f451-4e75-84aa-fa0672b5feb6",
    "completedHidden": true,
    "caretLoc": 4,
    "uuid": "8fb219be-71c2-454d-97de-bd745c277e1e",
    "zoomUUID": "8fb219be-71c2-454d-97de-bd745c277e1e"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
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
                            "uuid": "5ed5f33d-f451-4e75-84aa-fa0672b5feb6"
                        }
                    ],
                    "uuid": "204dc0c4-6a8b-45c7-924b-0f87ee7d2854"
                },
                {
                    "title": "four",
                    "uuid": "4ffc823c-bb9d-44cb-99ac-92c4c7cb5faf"
                }
            ],
            "uuid": "a6ddf085-a7d9-4ea0-bb47-dbe71a3a595c"
        }
    ],
    "selected": "5ed5f33d-f451-4e75-84aa-fa0672b5feb6",
    "completedHidden": true,
    "caretLoc": 4,
    "uuid": "8fb219be-71c2-454d-97de-bd745c277e1e",
    "zoomUUID": "8fb219be-71c2-454d-97de-bd745c277e1e"
}
        */
			})
		);

		Tree.indent(tree);
		assert.equal(Tree.toStringClean(tree), Tree.toStringClean(after));
	});
});

describe('newLineAtCursor', function() {
	it('one', function() {
		var tree = Tree.fromString(
			multiline(function() {
				/*
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
                            "uuid": "2db2083d-dfef-4e5c-a01d-ccc61221a425"
                        }
                    ],
                    "uuid": "e125b42d-15d6-402c-9a1f-01a465ec76c3"
                },
                {
                    "title": "four",
                    "uuid": "03b49580-4921-44f5-9a82-868fdac299ea"
                }
            ],
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        }
    ],
    "selected": "2db2083d-dfef-4e5c-a01d-ccc61221a425",
    "completedHidden": true,
    "caretLoc": 5,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
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
                            "uuid": "2db2083d-dfef-4e5c-a01d-ccc61221a425"
                        },
                        {
                            "title": "",
                            "uuid": "1"
                        }
                    ],
                    "uuid": "e125b42d-15d6-402c-9a1f-01a465ec76c3"
                },
                {
                    "title": "four",
                    "uuid": "03b49580-4921-44f5-9a82-868fdac299ea"
                }
            ],
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        }
    ],
    "selected": "1",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);

		Tree.newLineAtCursor(tree);
		assert.equal(Tree.toStringClean(tree), Tree.toStringClean(after));
	});

	it('two', function() {
		var tree = Tree.fromString(
			multiline(function() {
				/*
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
                            "uuid": "96d1bed0-65fb-4358-ae92-f0a648ad5673"
                        }
                    ],
                    "uuid": "f1115362-6835-42b7-bceb-2d5948dc292a"
                }
            ],
            "uuid": "3084a5d5-d9d8-4cae-9fe7-b12c619d452f"
        }
    ],
    "selected": "f1115362-6835-42b7-bceb-2d5948dc292a",
    "completedHidden": true,
    "caretLoc": 3,
    "uuid": "006f3f71-ed22-44d2-b6a3-9d98f263587a",
    "zoomUUID": "006f3f71-ed22-44d2-b6a3-9d98f263587a"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
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
                            "title": "",
                            "uuid": "1"
                        },
                        {
                            "title": "three",
                            "uuid": "96d1bed0-65fb-4358-ae92-f0a648ad5673"
                        }
                    ],
                    "uuid": "f1115362-6835-42b7-bceb-2d5948dc292a"
                }
            ],
            "uuid": "3084a5d5-d9d8-4cae-9fe7-b12c619d452f"
        }
    ],
    "selected": "1",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "006f3f71-ed22-44d2-b6a3-9d98f263587a",
    "zoomUUID": "006f3f71-ed22-44d2-b6a3-9d98f263587a"
}
        */
			})
		);

		Tree.newLineAtCursor(tree);
		assert.equal(Tree.toStringClean(tree), Tree.toStringClean(after));
	});

	it('three', function() {
		var tree = Tree.fromString(
			multiline(function() {
				/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "f1115362-6835-42b7-bceb-2d5948dc292a"
                }
            ],
            "uuid": "3084a5d5-d9d8-4cae-9fe7-b12c619d452f"
        }
    ],
    "selected": "f1115362-6835-42b7-bceb-2d5948dc292a",
    "completedHidden": true,
    "caretLoc": 2,
    "uuid": "006f3f71-ed22-44d2-b6a3-9d98f263587a",
    "zoomUUID": "006f3f71-ed22-44d2-b6a3-9d98f263587a"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "tw",
                    "uuid": "f1115362-6835-42b7-bceb-2d5948dc292a"
                },
                {
                    "title": "o",
                    "uuid": "1"
                }
            ],
            "uuid": "3084a5d5-d9d8-4cae-9fe7-b12c619d452f"
        }
    ],
    "selected": "1",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "006f3f71-ed22-44d2-b6a3-9d98f263587a",
    "zoomUUID": "006f3f71-ed22-44d2-b6a3-9d98f263587a"
}
        */
			})
		);

		Tree.newLineAtCursor(tree);
		assert.equal(Tree.toStringClean(tree), Tree.toStringClean(after));
	});
});

describe('findSelected and findNextNode', function() {
	it('Moving down through a tree', function() {
		var tree = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "f817f8ca-bd87-463a-ac3f-7ea9e6498d59"
                },
                {
                    "title": "three",
                    "childNodes": [
                        {
                            "title": "four",
                            "childNodes": [
                                {
                                    "title": "five",
                                    "uuid": "cce07751-f471-4517-a1a4-136fea91e6f8"
                                }
                            ],
                            "uuid": "507bc637-ca0c-4cc4-95d8-79e5f236c2a6"
                        },
                        {
                            "title": "six",
                            "uuid": "7eef6a3f-71df-4fd6-a6d1-a2ad925c8429"
                        }
                    ],
                    "uuid": "ea87543e-ff41-4562-b340-49180b8b779f"
                }
            ],
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        }
    ],
    "selected": "f817f8ca-bd87-463a-ac3f-7ea9e6498d59",
    "completedHidden": true,
    "caretLoc": 3,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);

		assert.equal(Tree.findSelected(tree).title, 'two');
		Tree.selectNextNode(tree);
		assert.equal(Tree.findSelected(tree).title, 'three');
		Tree.selectNextNode(tree);
		assert.equal(Tree.findSelected(tree).title, 'four');
		Tree.selectNextNode(tree);
		assert.equal(Tree.findSelected(tree).title, 'five');
		Tree.selectNextNode(tree);
		assert.equal(Tree.findSelected(tree).title, 'six');
	});
});

describe('Looking for the previous node of some selected node (findPreviousNode)', function() {
	it('If you have no siblings above you, the previous node is the parent', function() {
		var tree = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "dd9f1f7c-b9ea-40f7-bcac-5bd8686a6ff7"
                },
                {
                    "title": "three",
                    "uuid": "6fad8b6c-96f7-4075-8aee-b63c29d2321b"
                }
            ],
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        }
    ],
    "selected": "dd9f1f7c-b9ea-40f7-bcac-5bd8686a6ff7",
    "completedHidden": true,
    "caretLoc": 3,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);

		let selected = Tree.findSelected(tree);
		let next = Tree.findPreviousNode(selected);
		assert.equal(selected.title, 'two');
		assert.equal(next.title, 'one');
	});

	it('If you have a sibling above you, that is the previous node', function() {
		var tree = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "dd9f1f7c-b9ea-40f7-bcac-5bd8686a6ff7"
                },
                {
                    "title": "three",
                    "uuid": "6fad8b6c-96f7-4075-8aee-b63c29d2321b"
                }
            ],
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        }
    ],
    "selected": "6fad8b6c-96f7-4075-8aee-b63c29d2321b",
    "completedHidden": true,
    "caretLoc": 5,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);

		let selected = Tree.findSelected(tree);
		let next = Tree.findPreviousNode(selected);
		assert.equal(selected.title, 'three');
		assert.equal(next.title, 'two');
	});

	// TODO this is not symetric with getNextNode. getNextNode never returns null.
	it('If there are no siblings above you and you have no parent, the previous node is... null', function() {
		var tree = Tree.fromString(
			multiline(function() {
				/*
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
                            "uuid": "6fad8b6c-96f7-4075-8aee-b63c29d2321b"
                        }
                    ],
                    "uuid": "dd9f1f7c-b9ea-40f7-bcac-5bd8686a6ff7"
                },
                {
                    "title": "four",
                    "uuid": "b3717c66-7e8e-459d-84e9-c61300a3dc48"
                }
            ],
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        }
    ],
    "selected": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);

		let selected = Tree.findSelected(tree);
		let next = Tree.findPreviousNode(selected);
		assert.equal(selected.title, 'one');
		assert.equal(next, null);
	});

	it('four', function() {
		var tree = Tree.fromString(
			multiline(function() {
				/*
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
                            "uuid": "6fad8b6c-96f7-4075-8aee-b63c29d2321b"
                        }
                    ],
                    "uuid": "dd9f1f7c-b9ea-40f7-bcac-5bd8686a6ff7"
                },
                {
                    "title": "four",
                    "uuid": "b3717c66-7e8e-459d-84e9-c61300a3dc48"
                }
            ],
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        }
    ],
    "selected": "b3717c66-7e8e-459d-84e9-c61300a3dc48",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);

		var selected = Tree.findSelected(tree);
		var next = Tree.findPreviousNode(selected);
		assert.equal(selected.title, 'four');
		assert.equal(next.title, 'three');
	});
});

it('testSelectNext', function() {
	var treeNext2 = [
		{
			title: 'howdy',
			childNodes: [
				{ title: 'bobby' },
				{
					title: 'suzie',
					childNodes: [
						{
							title: 'puppy',
							childNodes: [{ title: 'dog', selected: true }]
						},
						{ title: 'cherry' }
					]
				}
			]
		}
	];
	// TODO make statements like this more clear about why the first call is childNodes[0]... it's because
	// this is wrapped in some root node.
	var tree = Tree.makeTree(treeNext2).childNodes[0].childNodes[1].childNodes[0]
		.childNodes[0];
	var next = Tree.findNextNode(tree);
	assert.equal(next.title, 'cherry');
});

describe('deleteSelected', function() {
	it('deleting an item with children should kill the children', function() {
		var tree = Tree.fromString(
			multiline(function() {
				/*
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
                            "uuid": "28cb09f2-e362-4aac-ae1a-ebce5dc063f0"
                        },
                        {
                            "title": "four",
                            "uuid": "9f7308f0-6347-4f8a-b1a4-76d0386c8146"
                        }
                    ],
                    "uuid": "3e86ff52-4d76-46ac-88ae-cc056a7d3034"
                }
            ],
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        }
    ],
    "selected": "3e86ff52-4d76-46ac-88ae-cc056a7d3034",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        }
    ],
    "selected": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09",
    "completedHidden": true,
    "caretLoc": 3,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);

		Tree.deleteSelected(tree, { caretLoc: 0 });
		assert.equal(Tree.toStringClean(tree), Tree.toStringClean(after));
	});

	it('deleting the last item works', function() {
		var tree = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "29b7989f-c4f0-46ec-8f0c-db95ad35b7d4"
                }
            ],
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        },
        {
            "title": "three",
            "uuid": "3e812786-6b8e-439f-9c5a-56046c834d20"
        }
    ],
    "selected": "3e812786-6b8e-439f-9c5a-56046c834d20",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "29b7989f-c4f0-46ec-8f0c-db95ad35b7d4"
                }
            ],
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        }
    ],
    "selected": "29b7989f-c4f0-46ec-8f0c-db95ad35b7d4",
    "completedHidden": true,
    "caretLoc": 3,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);
		Tree.deleteSelected(tree, { caretLoc: 0 });
		assert.equal(Tree.toStringClean(tree), Tree.toStringClean(after));
	});
});

describe('shiftUp', function() {
	it('regular', function() {
		var before = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        },
        {
            "title": "two",
            "uuid": "3e86ff52-4d76-46ac-88ae-cc056a7d3034"
        }
    ],
    "selected": "3e86ff52-4d76-46ac-88ae-cc056a7d3034",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "two",
            "uuid": "3e86ff52-4d76-46ac-88ae-cc056a7d3034"
        },
        {
            "title": "one",
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        }
    ],
    "selected": "3e86ff52-4d76-46ac-88ae-cc056a7d3034",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);
		Tree.shiftUp(before);

		assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
	});
	it('moving an item up that\'s already at the top does nothing', function() {
		var before = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        },
        {
            "title": "two",
            "uuid": "3e86ff52-4d76-46ac-88ae-cc056a7d3034"
        }
    ],
    "selected": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09",
    "completedHidden": true,
    "caretLoc": 2,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        },
        {
            "title": "two",
            "uuid": "3e86ff52-4d76-46ac-88ae-cc056a7d3034"
        }
    ],
    "selected": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09",
    "completedHidden": true,
    "caretLoc": 2,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);
		Tree.shiftUp(before);

		assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
	});
	it('Moving a single child up does nothing', function() {
		var before = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "3e86ff52-4d76-46ac-88ae-cc056a7d3034"
                }
            ],
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        }
    ],
    "selected": "3e86ff52-4d76-46ac-88ae-cc056a7d3034",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "3e86ff52-4d76-46ac-88ae-cc056a7d3034"
                }
            ],
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        }
    ],
    "selected": "3e86ff52-4d76-46ac-88ae-cc056a7d3034",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);
		Tree.shiftUp(before);

		assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
	});
	it('Shifting up over items with children', function() {
		var before = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "3e86ff52-4d76-46ac-88ae-cc056a7d3034"
                }
            ],
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        },
        {
            "title": "three",
            "uuid": "eb866f77-7d65-4c74-964a-b42175377ed4"
        }
    ],
    "selected": "eb866f77-7d65-4c74-964a-b42175377ed4",
    "completedHidden": true,
    "caretLoc": 1,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "three",
            "uuid": "eb866f77-7d65-4c74-964a-b42175377ed4"
        },
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "3e86ff52-4d76-46ac-88ae-cc056a7d3034"
                }
            ],
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        }
    ],
    "selected": "eb866f77-7d65-4c74-964a-b42175377ed4",
    "completedHidden": true,
    "caretLoc": 1,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);
		Tree.shiftUp(before);

		assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
	});
});

describe('shiftDown', function() {
	it('regular', function() {
		var before = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        },
        {
            "title": "two",
            "uuid": "3e86ff52-4d76-46ac-88ae-cc056a7d3034"
        }
    ],
    "selected": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09",
    "completedHidden": true,
    "caretLoc": 1,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "two",
            "uuid": "3e86ff52-4d76-46ac-88ae-cc056a7d3034"
        },
        {
            "title": "one",
            "uuid": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09"
        }
    ],
    "selected": "3dff6add-6444-4aac-8bb2-1ddfb6d7ec09",
    "completedHidden": true,
    "caretLoc": 1,
    "uuid": "7265e8c8-f59d-4088-bb4c-02c62319eb57",
    "zoomUUID": "7265e8c8-f59d-4088-bb4c-02c62319eb57"
}
        */
			})
		);
		Tree.shiftDown(before);

		assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
	});
});

describe('selectPreviousNode', function() {
	it('regular', function() {
		var before = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "uuid": "cc55b9aa-faf8-4653-a61f-3c8e341e0d22"
        },
        {
            "title": "two",
            "uuid": "76a4b190-49d7-40f6-bc94-8c008e8b0620"
        }
    ],
    "selected": "76a4b190-49d7-40f6-bc94-8c008e8b0620",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "b299c16d-3bb0-4986-99b7-f801c5ceee5b",
    "zoomUUID": "b299c16d-3bb0-4986-99b7-f801c5ceee5b"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "uuid": "cc55b9aa-faf8-4653-a61f-3c8e341e0d22"
        },
        {
            "title": "two",
            "uuid": "76a4b190-49d7-40f6-bc94-8c008e8b0620"
        }
    ],
    "selected": "cc55b9aa-faf8-4653-a61f-3c8e341e0d22",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "b299c16d-3bb0-4986-99b7-f801c5ceee5b",
    "zoomUUID": "b299c16d-3bb0-4986-99b7-f801c5ceee5b"
}
        */
			})
		);
		Tree.selectPreviousNode(before);
		assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));

		// Doesn't change the second time
		Tree.selectPreviousNode(before);
		assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
	});
});

describe('selectNextNode', function() {
	it('If you have a child, that is the next node', function() {
		var before = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "76a4b190-49d7-40f6-bc94-8c008e8b0620"
                },
                {
                    "title": "three",
                    "uuid": "fed034e3-5c4d-4a36-9d77-2441c5db7660"
                }
            ],
            "uuid": "cc55b9aa-faf8-4653-a61f-3c8e341e0d22"
        },
        {
            "title": "four",
            "uuid": "656c4b03-9bd2-4fc0-83e7-e57d5af51a17"
        }
    ],
    "selected": "cc55b9aa-faf8-4653-a61f-3c8e341e0d22",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "b299c16d-3bb0-4986-99b7-f801c5ceee5b",
    "zoomUUID": "b299c16d-3bb0-4986-99b7-f801c5ceee5b"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "76a4b190-49d7-40f6-bc94-8c008e8b0620"
                },
                {
                    "title": "three",
                    "uuid": "fed034e3-5c4d-4a36-9d77-2441c5db7660"
                }
            ],
            "uuid": "cc55b9aa-faf8-4653-a61f-3c8e341e0d22"
        },
        {
            "title": "four",
            "uuid": "656c4b03-9bd2-4fc0-83e7-e57d5af51a17"
        }
    ],
    "selected": "76a4b190-49d7-40f6-bc94-8c008e8b0620",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "b299c16d-3bb0-4986-99b7-f801c5ceee5b",
    "zoomUUID": "b299c16d-3bb0-4986-99b7-f801c5ceee5b"
}
        */
			})
		);
		Tree.selectNextNode(before);
		assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
	});
	it('If you have no children and a sibling, that is the next node', function() {
		var before = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "76a4b190-49d7-40f6-bc94-8c008e8b0620"
                },
                {
                    "title": "three",
                    "uuid": "fed034e3-5c4d-4a36-9d77-2441c5db7660"
                }
            ],
            "uuid": "cc55b9aa-faf8-4653-a61f-3c8e341e0d22"
        },
        {
            "title": "four",
            "uuid": "656c4b03-9bd2-4fc0-83e7-e57d5af51a17"
        }
    ],
    "selected": "76a4b190-49d7-40f6-bc94-8c008e8b0620",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "b299c16d-3bb0-4986-99b7-f801c5ceee5b",
    "zoomUUID": "b299c16d-3bb0-4986-99b7-f801c5ceee5b"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "76a4b190-49d7-40f6-bc94-8c008e8b0620"
                },
                {
                    "title": "three",
                    "uuid": "fed034e3-5c4d-4a36-9d77-2441c5db7660"
                }
            ],
            "uuid": "cc55b9aa-faf8-4653-a61f-3c8e341e0d22"
        },
        {
            "title": "four",
            "uuid": "656c4b03-9bd2-4fc0-83e7-e57d5af51a17"
        }
    ],
    "selected": "fed034e3-5c4d-4a36-9d77-2441c5db7660",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "b299c16d-3bb0-4986-99b7-f801c5ceee5b",
    "zoomUUID": "b299c16d-3bb0-4986-99b7-f801c5ceee5b"
}
        */
			})
		);
		Tree.selectNextNode(before);
		assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
	});

	it('If you are zoomed in and are at the bottom of your view, do not select the next node', function() {
		var before = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "76a4b190-49d7-40f6-bc94-8c008e8b0620"
                },
                {
                    "title": "three",
                    "uuid": "fed034e3-5c4d-4a36-9d77-2441c5db7660"
                }
            ],
            "uuid": "cc55b9aa-faf8-4653-a61f-3c8e341e0d22"
        },
        {
            "title": "four",
            "uuid": "656c4b03-9bd2-4fc0-83e7-e57d5af51a17"
        }
    ],
    "selected": "fed034e3-5c4d-4a36-9d77-2441c5db7660",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "b299c16d-3bb0-4986-99b7-f801c5ceee5b",
    "zoomUUID": "cc55b9aa-faf8-4653-a61f-3c8e341e0d22"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "76a4b190-49d7-40f6-bc94-8c008e8b0620"
                },
                {
                    "title": "three",
                    "uuid": "fed034e3-5c4d-4a36-9d77-2441c5db7660"
                }
            ],
            "uuid": "cc55b9aa-faf8-4653-a61f-3c8e341e0d22"
        },
        {
            "title": "four",
            "uuid": "656c4b03-9bd2-4fc0-83e7-e57d5af51a17"
        }
    ],
    "selected": "fed034e3-5c4d-4a36-9d77-2441c5db7660",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "b299c16d-3bb0-4986-99b7-f801c5ceee5b",
    "zoomUUID": "cc55b9aa-faf8-4653-a61f-3c8e341e0d22"
}
        */
			})
		);
		Tree.selectNextNode(before);
		assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
	});
});

describe('selectLastNode', function() {
	it('When zoomed in, the last node should be the last node of the zoomed in view', function() {
		var before = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "3398b59a-b442-408d-95ea-c3ed3010c940"
                },
                {
                    "title": "three",
                    "uuid": "6b749288-063b-4ba6-b31f-8dd75b9e7632"
                }
            ],
            "uuid": "819da9dc-875f-4997-a503-368e9cc92846"
        },
        {
            "title": "four",
            "uuid": "6a878de7-1608-4056-a325-c617ca9789b2"
        }
    ],
    "selected": "3398b59a-b442-408d-95ea-c3ed3010c940",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "aafec563-0043-4b6a-a1ed-4d5604da6eb3",
    "zoomUUID": "819da9dc-875f-4997-a503-368e9cc92846"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "3398b59a-b442-408d-95ea-c3ed3010c940"
                },
                {
                    "title": "three",
                    "uuid": "6b749288-063b-4ba6-b31f-8dd75b9e7632"
                }
            ],
            "uuid": "819da9dc-875f-4997-a503-368e9cc92846"
        },
        {
            "title": "four",
            "uuid": "6a878de7-1608-4056-a325-c617ca9789b2"
        }
    ],
    "selected": "6b749288-063b-4ba6-b31f-8dd75b9e7632",
    "completedHidden": true,
    "caretLoc": 5,
    "uuid": "aafec563-0043-4b6a-a1ed-4d5604da6eb3",
    "zoomUUID": "819da9dc-875f-4997-a503-368e9cc92846"
}
        */
			})
		);
		Tree.selectLastNode(before, { caretLoc: 0 });
		assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
	});
});

describe('selectFirstNode', function() {
	it('First node is the first node up, up to the zoom level', function() {
		var before = Tree.fromString(
			multiline(function() {
				/*
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
                            "uuid": "6b749288-063b-4ba6-b31f-8dd75b9e7632"
                        }
                    ],
                    "uuid": "3398b59a-b442-408d-95ea-c3ed3010c940"
                }
            ],
            "uuid": "819da9dc-875f-4997-a503-368e9cc92846"
        }
    ],
    "selected": "6b749288-063b-4ba6-b31f-8dd75b9e7632",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "aafec563-0043-4b6a-a1ed-4d5604da6eb3",
    "zoomUUID": "3398b59a-b442-408d-95ea-c3ed3010c940"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
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
                            "uuid": "6b749288-063b-4ba6-b31f-8dd75b9e7632"
                        }
                    ],
                    "uuid": "3398b59a-b442-408d-95ea-c3ed3010c940"
                }
            ],
            "uuid": "819da9dc-875f-4997-a503-368e9cc92846"
        }
    ],
    "selected": "3398b59a-b442-408d-95ea-c3ed3010c940",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "aafec563-0043-4b6a-a1ed-4d5604da6eb3",
    "zoomUUID": "3398b59a-b442-408d-95ea-c3ed3010c940"
}
        */
			})
		);
		Tree.selectFirstNode(before, { caretLoc: 0 });
		assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
	});
});

describe('unindent', function() {
	it('Do not unindent outside of your current zoom', function() {
		var before = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "d0fa509a-788a-440b-a52d-6dc26e80a727"
                }
            ],
            "uuid": "f504ddc1-44d7-4c25-a4c8-316e5010ed18"
        }
    ],
    "selected": "d0fa509a-788a-440b-a52d-6dc26e80a727",
    "completedHidden": true,
    "uuid": "7e843b82-0ed8-4211-9c70-699e8f8a9ff5",
    "zoomUUID": "f504ddc1-44d7-4c25-a4c8-316e5010ed18"
}
        */
			})
		);

		var after = Tree.fromString(
			multiline(function() {
				/*
{
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "d0fa509a-788a-440b-a52d-6dc26e80a727"
                }
            ],
            "uuid": "f504ddc1-44d7-4c25-a4c8-316e5010ed18"
        }
    ],
    "selected": "d0fa509a-788a-440b-a52d-6dc26e80a727",
    "completedHidden": true,
    "uuid": "7e843b82-0ed8-4211-9c70-699e8f8a9ff5",
    "zoomUUID": "f504ddc1-44d7-4c25-a4c8-316e5010ed18"
}
        */
			})
		);
		Tree.unindent(before);
		assert.equal(Tree.toStringClean(before), Tree.toStringClean(after));
	});
});

describe('breadcrumb', function() {
	it('regular', function() {
		var tree = Tree.fromString(
			multiline(function() {
				/*
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
        */
			})
		);

		var root = tree;
		assert.deepEqual(Tree.getBreadcrumb(root), ['Home', 'one', 'two']);
	});
});
