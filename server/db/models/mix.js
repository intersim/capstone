'use strict';

var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var TrackSchema = new mongoose.Schema({
    measures: [
      {
        rest: {
          type: Boolean,
          default: true
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
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

TrackSchema.path('measures').validate(function(measures) {
  return measures.every(function(item) {
    return item.rest || item.loop;
  })
})

var MixSchema = new mongoose.Schema({
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
  tracks: [TrackSchema]
});

//add deepPopulate option - populates a reference's reference
MixSchema.plugin(deepPopulate);


// MANAGE MIX

MixSchema.statics.findByLoop = function(loopId) {
  return this.find({'tracks.measures.loop': loopId})
  .then(function(mix) {
    return mix;
  })
}

MixSchema.methods.publish = function() {
  this.isPublic = true;
  return this.save();
}

MixSchema.methods.addTag = function(tag) {
  this.tags.push(tag);
  return this.save();
}

MixSchema.methods.addTags = function(arr) {
  this.tags = this.tags.concat(arr);
  return this.save();
}

MixSchema.methods.removeTag = function(tagToRemove) {
  this.tags = this.tags.filter(function(tag) {
    return tag !== tagToRemove;
  })
  return this.save();
}

MixSchema.methods.removeTags = function(tagsToRemove) {
  this.tags = this.tags.filter(function(tag) {
    return tagsToRemove.indexOf(tag) === -1;
  })
  return this.save();
}

MixSchema.methods.getUserComments = function() {
  return mongoose.model('Comment').find({target: this._id});
}

// CHANGE MIX MUSIC FEATURES

MixSchema.methods.changeTempo = function(change) {
  this.tempo += change;
  return this.save();
}

mongoose.model('Mix', MixSchema);

