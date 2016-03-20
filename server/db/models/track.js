'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    loops: [
        {
            loop: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Loop'
            },
            startTime: Number
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

module.exports = mongoose.model('Track', schema);