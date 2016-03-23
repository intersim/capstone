'use strict';

var mongoose = require('mongoose');

// TONEJS - scores can have following values:
// {
//  "tempo": <bpm number>,
//  "timeSignature": <time signature object>,
//  <instrumentName>: [ <note object that will be passed into the Tone.Note constructor> ] (This value that is returned when the channel callback is invoked.)
//}

var CompositionSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  numFavorites: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  tempo: Number,
  numBars: {
    type: Number,
    default: 12
  },
  tracks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  }]
});

// CHANGE COMPOSITION MUSIC FEATURES

CompositionSchema.methods.changeTempo = function(change) {
  this.tempo += change;
  return this.save();
}

CompositionSchema.methods.createTrack = function() {
  mongoose.model('Track').create({})
  .then(function(track) {
    this.tracks.push(track._id);
    return this.save();
  })
}

CompositionSchema.methods.deleteTrack = function(trackNum) {
  var trackToDelete = this.tracks[trackNum];
  mongoose.model('Track').remove({_id: trackToDelete})
  .then(function( track ) {
    this.tracks.splice(trackNum);
    return this.save();
  })
}

// MANAGE COMPOSITION

CompositionSchema.methods.publish = function() {
  this.isPublic = true;
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

CompositionSchema.methods.getUserComments = function() {
  return mongoose.model('Comment').find({target: this._id});
}

CompositionSchema.statics.findByLoop = function(loopId) {
    mongoose.model('Track').find({'loops.loop': loopId })
    .then(function(tracks) {
        return Promise.map(tracks, function(track) {
            return this.findById(track.composition);
        })
    })
}

mongoose.model('Composition', CompositionSchema);

