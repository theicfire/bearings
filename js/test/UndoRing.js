var assert = require("assert");
var _ = require("underscore");
var UndoRing = require('../lib/UndoRing');

describe('undoredo', function(){
    it('Length of buffer should be initialized to 10', function(){
        var ring = new UndoRing(0, 10);
        assert.equal(10, ring.length);
    })
    it('blah', function(){
        var ring = new UndoRing(0, 4);
        assert.equal(ring.ring[0], 0);

        ring.ring = [0, 1, 2, 3];
        assert(_.isEqual([0, 1, 2, 3], ring.ring));
        assert.equal(0, ring.start);
        assert.equal(0, ring.end);

        ring.addPending(5);
        ring.commit();
        assert(_.isEqual([0, 5, 2, 3], ring.ring));
        assert.equal(1, ring.start);
        assert.equal(0, ring.end);

        ring.addPending(6);
        ring.commit();
        ring.addPending(7);
        ring.commit();
        ring.addPending(8);
        ring.commit();
        assert(_.isEqual([8, 5, 6, 7], ring.ring));
        assert.equal(0, ring.start);
        assert.equal(1, ring.end);
    })
    it('undoredo', function(){
        var ring = new UndoRing(0, 4);
        ring.addPending(5);
        ring.commit();
        ring.addPending(6);
        ring.commit();
        ring.addPending(7);
        ring.commit();
        ring.addPending(8);
        ring.commit();
        assert.equal(7, ring.undo());
        assert.equal(6, ring.undo());
        assert.equal(5, ring.undo());
        assert.equal(5, ring.undo());
        assert.equal(6, ring.redo());

        ring.addPending(10);
        ring.commit();
        assert.equal(6, ring.undo());
        assert.equal(5, ring.undo());
        assert.equal(6, ring.redo());
        assert.equal(10, ring.redo());
        assert.equal(10, ring.redo());

        ring.addPending(11);
        ring.commit();
        assert.equal(10, ring.undo());
        assert.equal(6, ring.undo());
        assert.equal(5, ring.undo());
        assert.equal(5, ring.undo());

        ring.addPending(12);
        ring.commit();
        assert.equal(5, ring.undo());
        assert.equal(5, ring.undo());
    })
    it('undoredo', function(){
        var ring = new UndoRing(0, 4);
        ring.addPending(5);
        ring.commit();
        assert.equal(0, ring.undo());
        assert.equal(0, ring.undo());
    })
})
