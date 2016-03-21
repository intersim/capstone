'use strict';

var mongoose = require('mongoose');
var Promise = require('bluebird');
var Composition = require('./composition');
var Track = require('./track');

var NoteSchema = new mongoose.Schema({
    length: {
        type: String,
        required: true,
        enum: ['1n', '2n', '4n', '8n', '16n']
    },
    pitch: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
                return /^[a-g]{1}(b|#|x|bb)?-?[0-9]+$/i.test(value) || /^\d*\.?\d+hz$/i.test(value);
            },
            message: '{VALUE} is not a valid note - correct format is <noteLetter>[#|b]<octaveNumber> OR frequency as a number'
        }
    },
    transportTime: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
                return /^(\d+(\.\d+)?\:){1,2}(\d+(\.\d+)?)?$/i.test(value);
            },
            message: '{VALUE} is not a valid transport time - specify in format BARS:QUARTERS:SIXTEENTHS'
        }
    }
})

var LoopSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tags: [String],
    publish: Boolean,
    name: {
        type: String,
        unique: true
    },
    numUses: Number,
    category: {
        type: String,
        enum: ['rhythm', 'chord', 'melody']
    },
    notes: [NoteSchema]
});

LoopSchema.statics.findByCreator = function(userId) {
    return this.find({creator: creator});
};

LoopSchema.statics.findByCategory = function(category) {
    return this.find({category: category});
}

LoopSchema.methods.findCompositions = function() {
    Track.find({'loops.loop': this._id })
    .then(function(tracks) {
        return Promise.map(tracks, function(track) {
            return Composition.findById(track.composition);
        })
    })
}

LoopSchema.methods.findSimilar = function() {
    return mongoose.model('Loop').findByTags(this.tags);
}

LoopSchema.methods.publish = function() {
    this.publish = true;
    return this.save();
}

module.exports = mongoose.model('Loop', LoopSchema);
