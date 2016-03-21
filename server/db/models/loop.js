'use strict';

var mongoose = require('mongoose');
var Promise = require('bluebird');

var NoteSchema = new mongoose.Schema({
    duration: {
        type: String,
        required: true,
        enum: ['1n', '2n', '4n', '8n', '16n']
    },
    note: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
                return /^[a-g]{1}(b|#|x|bb)?-?[0-9]+$/i.test(value) || /^\d*\.?\d+hz$/i.test(value);
            },
            message: '{VALUE} is not a valid note - correct format is <noteLetter>[#|b]<octaveNumber> OR frequency as a number'
        }
    },
    time: {
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
    isPublic: Boolean,
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

LoopSchema.methods.findSimilar = function() {
    return mongoose.model('Loop').findByTags(this.tags);
}

LoopSchema.methods.publish = function() {
    this.isPublic = true;
    return this.save();
}

LoopSchema.methods.addTag = function(tag) {
    this.tags.push(tag);
    return this.save();
}

LoopSchema.methods.addTags = function(arr) {
    this.tags = this.tags.concat(arr);
    return this.save();
}

LoopSchema.methods.removeTag = function(tagToRemove) {
    this.tags = this.tags.filter(function(tag) {
        return tag !== tagToRemove;
    })
    return this.save();
}

LoopSchema.methods.removeTags = function(tagsToRemove) {
    this.tags = this.filter(function(tag) {
        return tagsToRemove.indexOf(tag) === -1;
    })
    return this.save();
}

mongoose.model('Loop', LoopSchema);

