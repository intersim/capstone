'use strict';

var mongoose = require('mongoose');

var NoteSchema = new mongoose.Schema({
    length: {
        type: String,
        required: true,
        enum: ['1n', '2n', '4n', '8n', '16n']
    },
    value: {
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
    source: String,
    category: {
        type: String,
        enum: ['rhythm', 'chord', 'melody']
    }
});

LoopSchema.statics.findByCreator = function(userId) {
    return this.find({creator: creator});
};

LoopSchema.statics.findByTag = function(tag) {
    return this.find({tags: tag});
};

LoopSchema.statics.findByTags = function(tags) {
    return this.find({tags: { $in: tags } });
};

module.exports = mongoose.model('Loop', LoopSchema);
