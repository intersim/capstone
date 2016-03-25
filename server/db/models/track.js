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

/*
  Need to update these methods per new schema
*/
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

/*
  Watch out, .find() returns an array. $elemMatch && $eq  
*/
TrackSchema.post('remove', function(deletedTrack, next) {
  mongoose.model('Composition').find({tracks: deletedTrack._id})
  .then(function(composition){
    composition.tracks = composition.tracks.filter(function(track) {
        return track !== deletedTrack._id;
    });
    return composition.save();
  })
  .then(function(){
    next(); // The next isnt needed in the post hook
  })
});


/*
  This will make numBars NaN - Can call it with apply (Math.max.apply(null, trackTengthArray))
*/
TrackSchema.post('save', function(track, next) {
  track.findComposition().populate('tracks')
  .then(function(composition) {
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