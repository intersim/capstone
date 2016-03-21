'use strict';

var mongoose = require('mongoose');

var TrackSchema = new mongoose.Schema({
    loops: [
      {
        loop: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Loop'
        },
        startTime: {
          type: String,
          required: true,
          validate: {
            validator: function(value) {
                return /^(\d+(\.\d+)?\:){1,2}(\d+(\.\d+)?)?$/i.test(value);
            },
            message: '{VALUE} is not a valid transport time - specify in format BARS:QUARTERS:SIXTEENTHS'
          }
        },
        repeat: {
          type: Number,
          default: 1
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

TrackSchema.methods.addLoop = function(loopId, startTime, repeat) {
    if (!repeat) repeat = 1;
    this.loops.push({loop: loopId, startTime: startTime, repeat: repeat});
    return this.save();
}

TrackSchema.methods.removeLoop = function(loopId) {
    this.loops = this.loops.filter(function(loop) {
        return loop !== loopId;
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