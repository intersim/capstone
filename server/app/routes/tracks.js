var router = require('express').Router({mergeParams: true});
var models = require('../../db/models/');
var Composition = models.Composition;
var Track = models.Track;

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
});

router.param('trackId', function(req, res, next) {
  Track.findById(req.params.trackId)
  .then(function(track){
    if (!track || req.composition.tracks.indexOf(track._id) === -1) {
      next(new Error("could not find track for this composition"));
    } else {
      req.track = track;
      next();
    }
  })
})

router.put('/trackId', function(req, res, next) {
  var modifiedTrack;

  req.track.set(req.body);
  req.track.save()
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

router.delete('/trackId', function(req, res, next) {
  req.track.remove({})
  .then(function() {
    res.status(204).send();
  })
})

module.exports = router;