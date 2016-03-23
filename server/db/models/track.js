'use strict';

var mongoose = require('mongoose');

var TrackSchema = new mongoose.Schema({
    loops: [
      {
        loop: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Loop'
        },
        startBar: {
          type: Number,
          required: true,
        },
        repeat: {
          type: Number,
          default: 0
        }
      }
    ],
    volume: Number,
    numBars: {
      type: Number,
      default: 12
    },
    numVoices: Number,
    instrument: {
        type: String,
        enum: ['flute']
    }
});



TrackSchema.methods.addLoop = function(loopId, start, repeat) {
    if (!repeat) repeat = 1;
    this.loops.push({loop: loopId, startBar: start, repeat: repeat});
    if (this.numBars <= start + repeat) this.numBars = startTime + 1;
    return this.save();
}

TrackSchema.methods.removeLoop = function(loopId) {
    this.loops = this.loops.filter(function(loop) {
        if (loop === loopId) {
          if (this.numBars > loop.startBar) this.numBars = loop.startBar;
          return false;
        } else return true;
    })
    return this.save();
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

TrackSchema.post('remove', function(deletedTrack, next) {
  mongoose.model('Composition').find({tracks: deletedTrack._id})
  .then(function(composition){
    composition.tracks = composition.tracks.filter(function(track) {
        return track !== deletedTrack._id;
    });
    return composition.save();
  })
  .then(function(){
    next();
  })
});

module.exports = mongoose.model('Track', TrackSchema);