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
    },
    numUses: Number,
    source: String,
    category: {
        type: String,
        enum: ['rhythm', 'chord', 'melody']
    }

});

module.exports = mongoose.model('Loop', schema);
