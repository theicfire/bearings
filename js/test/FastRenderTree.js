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

        assert.deepEqual(FastRenderTree.diff(tree, after), {insert: ['5316505c-8eae-448e-9d05-2092e4d92061']});
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

        assert.deepEqual(FastRenderTree.diff(tree, after), {
                insert: ['88b3c739-56be-45cc-9072-0b2e7fc7b430'],
                delete: ['88b3c739-56be-45cc-9072-0b2e7fc7b430']});
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

        assert.deepEqual(FastRenderTree.diff(tree, after), {
                insert: ['88b3c739-56be-45cc-9072-0b2e7fc7b430'], 
                delete: ['88b3c739-56be-45cc-9072-0b2e7fc7b430']});
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

        assert.deepEqual(FastRenderTree.diff(tree, after), {
                delete: ['5d01db2c-c5bc-48c5-afe2-e2f13cbd7a7d']});
});
