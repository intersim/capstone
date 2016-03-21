'use strict';

var mongoose = require('mongoose');
var Track = require('./track');

var CompositionSchema = new mongoose.Schema({
  creator: {
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

CompositionSchema.methods.publish = function() {
  this.publish = true;
  return this.save();
}

CompositionSchema.methods.changeTempo = function(newTempo) {
  this.tempo = newTempo;
  return this.save();
}

module.exports = mongoose.model('Composition', CompositionSchema);