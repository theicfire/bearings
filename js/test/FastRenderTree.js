var assert = require("assert");
var _ = require("underscore");
var Tree = require('../lib/Tree');
var multiline = require('multiline');
var FastRenderTree  = require('../lib/FastRenderTree');

it('Should return a single insert if one node is inserted between the two trees', function(){
        var tree = Tree.fromString(multiline(function(){/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "88b3c739-56be-45cc-9072-0b2e7fc7b430"
                }
            ],
            "uuid": "ac36af0b-b35a-4d5e-8bf5-e4aea9d070ee"
        }
    ],
    "selected": "88b3c739-56be-45cc-9072-0b2e7fc7b430",
    "completedHidden": true,
    "caretLoc": 3,
    "uuid": "ee5e83c0-c825-415a-9da6-53f4204ed597",
    "zoomUUID": "ee5e83c0-c825-415a-9da6-53f4204ed597"
}
        */}));

        var after = Tree.fromString(multiline(function() {/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "88b3c739-56be-45cc-9072-0b2e7fc7b430"
                },
                {
                    "title": "",
                    "uuid": "5316505c-8eae-448e-9d05-2092e4d92061"
                }
            ],
            "uuid": "ac36af0b-b35a-4d5e-8bf5-e4aea9d070ee"
        }
    ],
    "selected": "5316505c-8eae-448e-9d05-2092e4d92061",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "ee5e83c0-c825-415a-9da6-53f4204ed597",
    "zoomUUID": "ee5e83c0-c825-415a-9da6-53f4204ed597"
}
        */}));

        var diff = FastRenderTree.diff(tree, after);
        var operations = FastRenderTree.operations(tree, after, diff);
        assert.deepEqual(diff, {insert: ['5316505c-8eae-448e-9d05-2092e4d92061']});
        assert.deepEqual(operations, [
                {newUUID: '5316505c-8eae-448e-9d05-2092e4d92061', insertAfter: '88b3c739-56be-45cc-9072-0b2e7fc7b430'}
        ]);
});



it('Should return a delete and an insert of the same element if it is changed', function(){
        var tree = Tree.fromString(multiline(function(){/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "88b3c739-56be-45cc-9072-0b2e7fc7b430"
                }
            ],
            "uuid": "ac36af0b-b35a-4d5e-8bf5-e4aea9d070ee"
        }
    ],
    "selected": "88b3c739-56be-45cc-9072-0b2e7fc7b430",
    "completedHidden": true,
    "caretLoc": 3,
    "uuid": "ee5e83c0-c825-415a-9da6-53f4204ed597",
    "zoomUUID": "ee5e83c0-c825-415a-9da6-53f4204ed597"
}
        */}));

        var after = Tree.fromString(multiline(function() {/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "twoa",
                    "uuid": "88b3c739-56be-45cc-9072-0b2e7fc7b430"
                }
            ],
            "uuid": "ac36af0b-b35a-4d5e-8bf5-e4aea9d070ee"
        }
    ],
    "selected": "88b3c739-56be-45cc-9072-0b2e7fc7b430",
    "completedHidden": true,
    "caretLoc": 4,
    "uuid": "ee5e83c0-c825-415a-9da6-53f4204ed597",
    "zoomUUID": "ee5e83c0-c825-415a-9da6-53f4204ed597"
}
        */}));

        var diff = FastRenderTree.diff(tree, after);
        var operations = FastRenderTree.operations(tree, after, diff);
        assert.deepEqual(diff, {
                insert: ['88b3c739-56be-45cc-9072-0b2e7fc7b430'],
                delete: ['88b3c739-56be-45cc-9072-0b2e7fc7b430']});
        assert.deepEqual(operations, [
                {del: '88b3c739-56be-45cc-9072-0b2e7fc7b430'},
                {newUUID: '88b3c739-56be-45cc-9072-0b2e7fc7b430', insertChild: 'ac36af0b-b35a-4d5e-8bf5-e4aea9d070ee'}
        ]);
});



it('Should return a delete and insert of the same element if it is unindented', function(){
        var tree = Tree.fromString(multiline(function(){/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "88b3c739-56be-45cc-9072-0b2e7fc7b430"
                }
            ],
            "uuid": "ac36af0b-b35a-4d5e-8bf5-e4aea9d070ee"
        }
    ],
    "selected": "88b3c739-56be-45cc-9072-0b2e7fc7b430",
    "completedHidden": true,
    "caretLoc": 3,
    "uuid": "ee5e83c0-c825-415a-9da6-53f4204ed597",
    "zoomUUID": "ee5e83c0-c825-415a-9da6-53f4204ed597"
}
        */}));

        var after = Tree.fromString(multiline(function() {/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "uuid": "ac36af0b-b35a-4d5e-8bf5-e4aea9d070ee"
        },
        {
            "title": "two",
            "uuid": "88b3c739-56be-45cc-9072-0b2e7fc7b430"
        }
    ],
    "selected": "88b3c739-56be-45cc-9072-0b2e7fc7b430",
    "completedHidden": true,
    "caretLoc": 3,
    "uuid": "ee5e83c0-c825-415a-9da6-53f4204ed597",
    "zoomUUID": "ee5e83c0-c825-415a-9da6-53f4204ed597"
}
        */}));

        var diff = FastRenderTree.diff(tree, after);
        var operations = FastRenderTree.operations(tree, after, diff);
        assert.deepEqual(diff, {
                insert: ['88b3c739-56be-45cc-9072-0b2e7fc7b430'], 
                delete: ['88b3c739-56be-45cc-9072-0b2e7fc7b430']});
        assert.deepEqual(operations, [
                {del: '88b3c739-56be-45cc-9072-0b2e7fc7b430'},
                {newUUID: '88b3c739-56be-45cc-9072-0b2e7fc7b430', insertAfter: 'ac36af0b-b35a-4d5e-8bf5-e4aea9d070ee'}
        ]);
});

it('Should delete an element if it is deleted', function(){
        var tree = Tree.fromString(multiline(function(){/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "97b37002-4af0-4dfe-bf38-7b2b4bc89b8f"
                },
                {
                    "title": "three",
                    "uuid": "5d01db2c-c5bc-48c5-afe2-e2f13cbd7a7d"
                }
            ],
            "uuid": "ee270269-693f-4ffc-8189-67a987bf8927"
        }
    ],
    "selected": "5d01db2c-c5bc-48c5-afe2-e2f13cbd7a7d",
    "completedHidden": true,
    "caretLoc": 5,
    "uuid": "9dd4037c-255f-48fe-83b4-7b2aabde2403",
    "zoomUUID": "9dd4037c-255f-48fe-83b4-7b2aabde2403"
}
        */}));

        var after = Tree.fromString(multiline(function() {/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "97b37002-4af0-4dfe-bf38-7b2b4bc89b8f"
                }
            ],
            "uuid": "ee270269-693f-4ffc-8189-67a987bf8927"
        }
    ],
    "selected": "97b37002-4af0-4dfe-bf38-7b2b4bc89b8f",
    "completedHidden": true,
    "caretLoc": 3,
    "uuid": "9dd4037c-255f-48fe-83b4-7b2aabde2403",
    "zoomUUID": "9dd4037c-255f-48fe-83b4-7b2aabde2403"
}
        */}));

        var diff = FastRenderTree.diff(tree, after);
        var operations = FastRenderTree.operations(tree, after, diff);
        assert.deepEqual(diff, {
                delete: ['5d01db2c-c5bc-48c5-afe2-e2f13cbd7a7d']});
        assert.deepEqual(operations, [
                {del: '5d01db2c-c5bc-48c5-afe2-e2f13cbd7a7d'}
        ]);
});

it('Moving an element should be a delete + insert', function(){
        var tree = Tree.fromString(multiline(function(){/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "97b37002-4af0-4dfe-bf38-7b2b4bc89b8f"
                },
                {
                    "title": "three",
                    "uuid": "39f34f0a-8822-4df0-8d53-4bef67951f6b"
                },
                {
                    "title": "four",
                    "uuid": "b0054db8-d9f5-45e8-9d3c-58cdf208cd6a"
                }
            ],
            "uuid": "ee270269-693f-4ffc-8189-67a987bf8927"
        }
    ],
    "selected": "b0054db8-d9f5-45e8-9d3c-58cdf208cd6a",
    "completedHidden": true,
    "caretLoc": 4,
    "uuid": "9dd4037c-255f-48fe-83b4-7b2aabde2403",
    "zoomUUID": "9dd4037c-255f-48fe-83b4-7b2aabde2403"
}
        */}));

        var after = Tree.fromString(multiline(function() {/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "two",
                    "uuid": "97b37002-4af0-4dfe-bf38-7b2b4bc89b8f"
                },
                {
                    "title": "four",
                    "uuid": "b0054db8-d9f5-45e8-9d3c-58cdf208cd6a"
                },
                {
                    "title": "three",
                    "uuid": "39f34f0a-8822-4df0-8d53-4bef67951f6b"
                }
            ],
            "uuid": "ee270269-693f-4ffc-8189-67a987bf8927"
        }
    ],
    "selected": "b0054db8-d9f5-45e8-9d3c-58cdf208cd6a",
    "completedHidden": true,
    "caretLoc": 4,
    "uuid": "9dd4037c-255f-48fe-83b4-7b2aabde2403",
    "zoomUUID": "9dd4037c-255f-48fe-83b4-7b2aabde2403"
}
        */}));
        var third = Tree.fromString(multiline(function() {/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "childNodes": [
                {
                    "title": "four",
                    "uuid": "b0054db8-d9f5-45e8-9d3c-58cdf208cd6a"
                },
                {
                    "title": "two",
                    "uuid": "97b37002-4af0-4dfe-bf38-7b2b4bc89b8f"
                },
                {
                    "title": "three",
                    "uuid": "39f34f0a-8822-4df0-8d53-4bef67951f6b"
                }
            ],
            "uuid": "ee270269-693f-4ffc-8189-67a987bf8927"
        }
    ],
    "selected": "b0054db8-d9f5-45e8-9d3c-58cdf208cd6a",
    "completedHidden": true,
    "caretLoc": 4,
    "uuid": "9dd4037c-255f-48fe-83b4-7b2aabde2403",
    "zoomUUID": "9dd4037c-255f-48fe-83b4-7b2aabde2403"
}
        */}));

        var diff = FastRenderTree.diff(tree, after);
        var diff2 = FastRenderTree.diff(after, third);
        var operations = FastRenderTree.operations(tree, after, diff);
        var operations2 = FastRenderTree.operations(after, third, diff2);
        assert.deepEqual(diff, {
                insert: ['b0054db8-d9f5-45e8-9d3c-58cdf208cd6a'],
                delete: ['b0054db8-d9f5-45e8-9d3c-58cdf208cd6a']});
        assert.deepEqual(operations, [
                {del: 'b0054db8-d9f5-45e8-9d3c-58cdf208cd6a'},
                {newUUID: 'b0054db8-d9f5-45e8-9d3c-58cdf208cd6a', insertAfter: '97b37002-4af0-4dfe-bf38-7b2b4bc89b8f'}
        ]);

        assert.deepEqual(operations2, [
                {del: 'b0054db8-d9f5-45e8-9d3c-58cdf208cd6a'},
                {newUUID: 'b0054db8-d9f5-45e8-9d3c-58cdf208cd6a', insertBefore: '97b37002-4af0-4dfe-bf38-7b2b4bc89b8f'}
        ]);
});


it('Should handle pressing enter in the middle of an element', function(){
        var tree = Tree.fromString(multiline(function(){/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "uuid": "3c59b0f0-f61f-4eec-b393-46cfb3b14cc4"
        },
        {
            "title": "two",
            "uuid": "5c887600-f205-4743-86aa-76108e7c6052"
        }
    ],
    "selected": "5c887600-f205-4743-86aa-76108e7c6052",
    "completedHidden": true,
    "caretLoc": 2,
    "uuid": "839f0a73-83ba-4397-8c3f-356166e879d4",
    "zoomUUID": "839f0a73-83ba-4397-8c3f-356166e879d4"
}
        */}));

        var after = Tree.fromString(multiline(function() {/*
        {
    "title": "special_root_title",
    "childNodes": [
        {
            "title": "one",
            "uuid": "3c59b0f0-f61f-4eec-b393-46cfb3b14cc4"
        },
        {
            "title": "tw",
            "uuid": "5c887600-f205-4743-86aa-76108e7c6052"
        },
        {
            "title": "o",
            "uuid": "5a3123c3-52ba-4f13-9f2d-f031dfffefab"
        }
    ],
    "selected": "5a3123c3-52ba-4f13-9f2d-f031dfffefab",
    "completedHidden": true,
    "caretLoc": 0,
    "uuid": "839f0a73-83ba-4397-8c3f-356166e879d4",
    "zoomUUID": "839f0a73-83ba-4397-8c3f-356166e879d4"
}
        */}));

        var diff = FastRenderTree.diff(tree, after);
        //var operations = FastRenderTree.operations(tree, after, diff);
        assert.deepEqual(diff, {
                delete: ['5c887600-f205-4743-86aa-76108e7c6052'],
                insert: ['5c887600-f205-4743-86aa-76108e7c6052', '5a3123c3-52ba-4f13-9f2d-f031dfffefab'],
                });
        //assert.deepEqual(operations, [
                //{del: '5d01db2c-c5bc-48c5-afe2-e2f13cbd7a7d'}
        //]);
});
