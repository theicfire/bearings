
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

        assert.equal(FastRenderTree.diff(tree, after), {insert: '5316505c-8eae-448e-9d05-2092e4d92061'});
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

        assert.equal(FastRenderTree.diff(tree, after), {
                insert: '88b3c739-56be-45cc-9072-0b2e7fc7b430', 
                delete: '88b3c739-56be-45cc-9072-0b2e7fc7b430'});
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

        assert.equal(FastRenderTree.diff(tree, after), {
                insert: '88b3c739-56be-45cc-9072-0b2e7fc7b430', 
                delete: '88b3c739-56be-45cc-9072-0b2e7fc7b430'});
});
