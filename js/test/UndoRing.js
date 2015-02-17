var assert = require("assert");
var _ = require("underscore");
var UndoRing = require('../lib/UndoRing');

describe('UndoRing', function(){
    describe('Initialize', function(){
        it('Length of buffer should be 10', function(){
            var ring = new UndoRing(0, 10);
            assert.equal(10, ring.length);
        })
    })
})

describe('UndoRing', function(){
    describe('more', function(){
        it('blah', function(){
            var ring = new UndoRing(0, 4);
            assert.equal(ring.ring[0], 0);

            ring.ring = [0, 1, 2, 3];
            assert(_.isEqual([0, 1, 2, 3], ring.ring));
            assert.equal(0, ring.start);
            assert.equal(0, ring.end);

            ring.add(5);
            assert(_.isEqual([0, 5, 2, 3], ring.ring));
            assert.equal(1, ring.start);
            assert.equal(0, ring.end);

            ring.add(6);
            ring.add(7);
            ring.add(8);
            assert(_.isEqual([8, 5, 6, 7], ring.ring));
            assert.equal(0, ring.start);
            assert.equal(1, ring.end);
        })
    })
})


describe('UndoRing', function(){
    describe('undoredo', function(){
        it('undoredo', function(){
            var ring = new UndoRing(0, 4);
            ring.add(5);
            ring.add(6);
            ring.add(7);
            ring.add(8);
            assert.equal(7, ring.undo());
            assert.equal(6, ring.undo());
            assert.equal(5, ring.undo());
            assert.equal(5, ring.undo());
            assert.equal(6, ring.redo());

            ring.add(10);
            assert.equal(6, ring.undo());
            assert.equal(5, ring.undo());
            assert.equal(6, ring.redo());
            assert.equal(10, ring.redo());
            assert.equal(10, ring.redo());

            ring.add(11);
            assert.equal(10, ring.undo());
            assert.equal(6, ring.undo());
            assert.equal(5, ring.undo());
            assert.equal(5, ring.undo());

            ring.add(12);
            assert.equal(5, ring.undo());
            assert.equal(5, ring.undo());
        })
    })
})

describe('UndoRing', function(){
    describe('undoredo', function(){
        it('undoredo', function(){
            var ring = new UndoRing(0, 4);
            ring.add(5);
            assert.equal(0, ring.undo());
            assert.equal(0, ring.undo());
        })
    })
})
