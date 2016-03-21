'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    loops: [
        {
            loop: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Loop'
            },
            startTime: Number,
            duration: Number
        }
    ],
    volume: Number,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    composition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Composition'
    },
    numVoices: Number,
    instrument: {
        type: String,
        enum: ['flute']
    }
});

schema.methods.addLoop = function(loopId, startTime, duration) {
    this.loops.push({loop: loopId, startTime: startTime, duration: duration});
    return this.save();
}

schema.methods.removeLoop = function(loopId) {
    this.loops = this.loops.filter(function(loop) {
        return loop !== loopId;
    })
    return this.save();
}

schema.methods.removeAllLoops = function() {
    this.loops = [];
    return this.save();
}

schema.methods.changeVolume = function(change) {
    this.volume = this.volume + change;
    return this.save();
}

schema.methods.changeInstrument = function(newInstrument) {
    this.instrument = newInstrument;
    return this.save();
}

module.exports = mongoose.model('Track', schema);