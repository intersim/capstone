'use strict';

var mongoose = require('mongoose');
require('./user');
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

LoopSchema.post('save', function(loop, done) {
    mongoose.model('User')
    .findById(loop.creator)
    .then(function(user) {
        if ( user.bucket.indexOf(loop._id) === -1 ) {
            user.bucket.push(loop._id)
            return user.save();
        }
    })
    .then(function(user){
        if (user) done();
        else done( new Error('no user found') );
    })
    .then(null, done)
})

mongoose.model('Loop', LoopSchema);

