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

CompositionSchema.methods.changeTempo = function(change) {
  this.tempo = this.tempo + change;
  return this.save();
}

CompositionSchema.methods.addTag = function(tag) {
  this.tags.push(tag);
  return this.save();
}

CompositionSchema.methods.addTags = function(arr) {
  this.tags = this.tags.concat(arr);
  return this.save();
}

CompositionSchema.methods.removeTag = function(tagToRemove) {
  this.tags = this.tags.filter(function(tag) {
    return tag !== tagToRemove;
  })
  return this.save();
}

CompositionSchema.methods.removeTags = function(tagsToRemove) {
  this.tags = this.tags.filter(function(tag) {
    return tagsToRemove.indexOf(tag) === -1;
  })
  return this.save();
}

module.exports = mongoose.model('Composition', CompositionSchema);