'use strict';

var mongoose = require('mongoose');
var Promise = require('bluebird');

var TrackSchema = new mongoose.Schema({
    measures: [
      {
        rest: {
          type: Boolean,
          required: true
        },
        loop: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Loop'
        }
      }
    ],
    volume: Number,
    numVoices: Number,
    instrument: {
        type: String,
        enum: ['flute']
    }
});

TrackSchema.path('measures').validate(function(measures) {
  return measures.every(function(item) {
    return item.rest || item.loop;
  })
})


// AW: hmmm
TrackSchema.methods.addLoop = function(loopId, idx) {
    while (this.loops.length < idx) this.loops.push({rest: true});
    this.loops.push({rest: false, loop: loopId});
    return this.save();
}

TrackSchema.methods.removeLoop = function(loopId) {
    for (var i in this.loops) {
      if (this.loops[i].loop === loopId) {
        this.loops[i].rest = true;
        delete this.loops[i].loop;
        break;
      }
    }
    return this.save();
}

TrackSchema.methods.findComposition = function(){
  // AW: tracks points to an array, yes? so you want to find one composition whose tracks array contains the 
  // passed in track Id.... but can't more than one composition contain the track id?
  // AW:  return mongoose.model('Composition').findOne({tracks: { $elemMatch: { $eq: this._id} } });

  return mongoose.model('Composition').findOne({tracks: this._id});
}

TrackSchema.methods.clear = function() {
  this.loops = [];
  return this.save();
}

TrackSchema.methods.changeVolume = function(change) {
    this.volume += change;
    return this.save();
}

TrackSchema.methods.changeInstrument = function(newInstrument) {
    this.instrument = newInstrument;
    return this.save();
}

TrackSchema.methods.changeNumVoices = function(num) {
    this.numVoices = num;
    return this.save();
}


// AW: no need for an asynchronous post remove hook here since 
// you don't have any other post remove hooks
TrackSchema.post('remove', function(deletedTrack, next) {
  mongoose.model('Composition').find({tracks: deletedTrack._id})
  .then(function(composition){
    // AW: _.remove()
    composition.tracks = composition.tracks.filter(function(track) {
        return track !== deletedTrack._id;
    });
    return composition.save();
  })
  .then(function(){
    next();
  })
});

// AW: same with post save 
TrackSchema.post('save', function(track, next) {
  track.findComposition().populate('tracks')
  .then(function(composition) {
    // AW: Math.max.apply(null, arr...)
      composition.numBars = Math.max( tracks.map(function(track) {
          return measures.length;
        })
      )
      return composition.save();
  })
  .then(function() {
    next();
  })
  .then(null, console.log);
})

module.exports = mongoose.model('Track', TrackSchema);