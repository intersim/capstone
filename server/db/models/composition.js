'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publish: Boolean,
  tags: [String],
  title: String,
  description: String,
  numFavorites: Number
});

module.exports = mongoose.model('Composition', schema);