'use strict';

var mongoose = require('mongoose');


var CompositionSchema = new mongoose.Schema({
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tempo: Number,
  publish: Boolean,
  tags: [String],
  title: String,
  description: String,
  numFavorites: Number
});

module.exports = mongoose.model('Composition', CompositionSchema);