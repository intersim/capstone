'use strict';

var mongoose = require('mongoose');
var Mix = require('./mix')
var Promise = require('bluebird');

var NoteSchema = new mongoose.Schema({
    duration: {
        type: String,
        required: true,
        enum: ['1n', '2n+4n+8n', '2n+4n', '2n+8n', '2n', '4n+8n', '4n', '8n+16n', '8n', '16n']
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
    startTime: {
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
    isPublic: {
        type: Boolean,
        default: true
    },
    name: String,
    numUses: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        enum: ['rhythm', 'chord', 'melody']
    },
    notes: [NoteSchema],
    dateCreated: {
        type: Date,
        default: Date.now
    }
});


LoopSchema.statics.findByCreator = function(userId) {
    return this.find({creator: userId});
};

LoopSchema.statics.findByCategory = function(category) {
    return this.find({category: category});
}

LoopSchema.methods.findSimilar = function() {
    return mongoose.model('Loop').findByTags(this.tags);
}

mongoose.model('Loop', LoopSchema);

