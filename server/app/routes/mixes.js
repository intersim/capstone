var router = require('express').Router();
var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var Track = mongoose.model('Track');
var Comment = mongoose.model('Comment');
var Promise = require('bluebird');

//gets all public mixes with tracks and routes
router.get('/', function(req, res, next) {
  Mix.find({isPublic: true})
  .deepPopulate('tracks tracks.measures.loop')
  .exec()
  .then(function(mixes){
    if (mixes) res.json(mixes);
    else res.status(404).send();
  })
  .then(null, next)
});

// create a new mix (current user, admin)
router.post('/', function(req, res, next) {
  var mix = req.body;

  Promise.map( mix.tracks, function(track) {
    return Track.create(track);
  } )
  .then(function(tracks) {
    mix.tracks = tracks.map(function (track) {
      return track._id;
    })
    if (!req.user.isAdmin || !mixes.creator) mix.creator = req.user._id;
    return Mix.create(mix);
  })
  .then(function(mix) {
    res.status(201).json(mix);
  })
  .then(null, function(err) {
    res.status(404).send();
  })
});

// mix param - loop up the mix in the db
router.param('mixId', function(req, res, next) {
  Mix.findById(req.params.mixId)
  .deepPopulate('tracks tracks.measures.loop')
  .exec()
  .then(function(mix) {
    if (mix) {
      req.mix = mix;
      next();
    } else {
      next(new Error('failed to find mix'));
    }
  })
  .then(null, next)
})

// retrieve a single mix (all users & guests)
router.get('/:mixId', function(req, res, next) {
  res.json(req.mix);
});

// update a mix (creator of the mix & admin)
router.put('/:mixId', function(req, res, next) {
  //E: had to add toString for second condition
  if (req.user.isAdmin || req.mix.creator.toString() === req.user._id.toString()) {
    //save tracks
    var mix = req.body;
    var tracksToUpdate = req.body.tracks;

    var arrTrackPromises = [];

    tracksToUpdate.forEach(function(trackToUpdate) {
      console.log("track id: ", trackToUpdate._id);
      var trackPromise = Track.findById(trackToUpdate._id).exec()
      arrTrackPromises.push(trackPromise);
    })

    Promise.all(arrTrackPromises)
    .then(function(tracks) {
      //save tracks to mix
      mix.tracks = tracks.map(function (track) {
        return track._id;
      });
      if (!req.user.isAdmin || !mixes.creator) mix.creator = req.user._id;
      return mix.save();
    })
    .then(function(mix){
        res.status(201).json(mix);
      });
    } else res.status(403).send();

    // Promise.all(arrTrackPromises, function(trackToUpdate) {
    //   console.log("track we're saving: ", trackToUpdate);
    //   Track.findById(trackToUpdate._id)
    //   .then(function(foundTrack) {
    //     foundTrack.set(trackToUpdate);
    //     return trackToUpdate.save();
    //   })
    // })

});

// delete a mix (creator of mix & admin)
router.delete('/:mixId', function(req, res, next) {
  if (req.user.isAdmin || req.mix.creator === req.user._id) {
    req.mix.remove()
    .then(function(){
      res.status(204).send();
    })
  } else res.status(403).send();
});

// comment subroutes for comment about the mix
router.use('/:mixId/comments', require('./comments'));

module.exports = router;