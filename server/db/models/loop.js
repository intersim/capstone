'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tags: [String],
    publish: Boolean,
    name: {
        type: String,
        unique: true
    }
    numUses: Number,
    source: String,
    category: {
        type: String,
        enum: ['rhythm', 'chord', 'melody']
    }
});

schema.statics.findByCreator = function(userId) {
    return this.find({creator: creator});
}

schema.statics.findByTag = function(tag) {
    return this.find({tags: tag});
}

schema.statics.findByTags = function(tags) {
    return this.find({tags: $in: tags});
}

module.exports = mongoose.model('Loop', schema);