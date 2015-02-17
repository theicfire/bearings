module.exports = UndoRing;

function UndoRing(obj, length) {
    this.length = length;
    this.ring = [];
    for (var i = 0; i < this.length; i++) {
        this.ring.push({childNodes: [{title: 'nothing'}]});
    }
    this.ring[0] = obj;
    this.start = 0;
    this.end = 0;
    this.current = 0;
}

//UndoRing.prototype.printCurrent = function() {
    //console.log('current undo', this.ring.map(function (x) {
        //return x.childNodes[0].title;
    //}));
    //console.log('and current is', this.current);
//};

UndoRing.prototype.undo = function() {
    if (this.current == this.end) {
        return this.ring[this.current];
    }
    this.current = ((this.current + this.length) - 1) % this.length;
    return this.ring[this.current];
}

UndoRing.prototype.redo = function() {
    if (this.current == this.start) {
        return this.ring[this.current];
    }
    this.current = (this.current + 1) % this.length;
    return this.ring[this.current];

}

UndoRing.prototype.add = function(obj) {
    console.log('adding obj', obj.childNodes[0].title);
    this.start = this.current;
    if (this.bufferFull()) {
        this._pop();
    }
    this.current = this.start = (this.start + 1) % this.length;
    this.ring[this.start] = obj;
}

UndoRing.prototype._pop = function() {
    this.end = (this.end + 1) % this.length;
}

UndoRing.prototype.bufferFull = function() {
    return (this.end - this.start) === 1 || (this.end === 0 && this.start === this.length - 1);
}


