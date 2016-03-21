'use strict';

var mongoose = require('mongoose');
var Track = require('./track');

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

CompositionSchema.methods.getTracks = function() {
  return Track.find({composition: this._id}).populate('loops').exec();
}

module.exports = mongoose.model('Composition', CompositionSchema);