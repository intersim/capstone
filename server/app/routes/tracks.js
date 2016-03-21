var router = require('express').Router({mergeParams: true});
var models = require('../../db/models/');
var Composition = models.Composition;
var Track = models.Track;

router.get('/', function(req, res, next) {

});

router.post('/', function(req, res, next) {
  var track = new Track(req.body);
  track.save()
  .then(function(newTrack) {
    if (newTrack) {
      req.composition.tracks.push(track._id);
      return req.composition.save()
    } else next(new Error("could not add track to composition"));
  })
  .then(function() {
    res.status(201).json(newTrack);
  })
  .then(null, next)
})

router.put('/trackId', function(req, res, next) {
  var modifiedTrack;

  Track.findById(req.params.trackId)
  .then(function(track) {
    if (track) {
      track.set(req.body);
      return track.save();
    } else next(new Error("could not find this track"));
  })
  .then(function(track) {
    modifiedTrack = track;
    req.composition.tracks.push(track._id);
    return req.composition.save();
  })
  .then(function() {
    res.status(201).json(modifiedTrack);
  })
  .then(null, next);
})



module.exports = router;