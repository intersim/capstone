var router = require('express').Router();
var mongoose = require('mongoose');
var Composition = mongoose.model('Composition');
var Track = mongoose.model('Track');
var Comment = mongoose.model('Comment');
var Promise = require('bluebird');

//gets all public compositions with tracks and routes
router.get('/', function(req, res, next) {
  Composition.find({isPublic: true})
  .deepPopulate('tracks tracks.measures.loop')
  .exec()
  .then(function(compositions){
    if (compositions) res.json(compositions);
    else res.status(404).send();
  })
  .then(null, next)
});

// create a new composition (current user, admin)
router.post('/', function(req, res, next) {
  var composition = req.body;

  Promise.map( composition.tracks, function(track) {
    return Track.create(track);
  } )
  .then(function(tracks) {
    composition.tracks = tracks.map(function (track) {
      return track._id;
    })
    if (!req.user.isAdmin || !compositions.creator) composition.creator = req.user._id;
    return Composition.create(composition);
  })
  .then(function(composition) {
    res.status(201).json(composition);
  })
  .then(null, function(err) {
    res.status(404).send();
  })
});

// composition param - loop up the composition in the db
router.param('compositionId', function(req, res, next) {
  Composition.findById(req.params.compositionId)
  .deepPopulate('tracks tracks.measures.loop')
  .exec()
  .then(function(composition) {
    if (composition) {
      req.composition = composition;
      next();
    } else {
      next(new Error('failed to find composition'));
    }
  })
  .then(null, next)
})

// retrieve a single composition (all users & guests)
router.get('/:compositionId', function(req, res, next) {
  res.json(req.composition);
});

// update a composition (creator of the composition & admin)
router.put('/:compositionId', function(req, res, next) {
  //E: had to add toString for second condition
  if (req.user.isAdmin || req.composition.creator.toString() === req.user._id.toString()) {
    req.composition.set(req.body);
    req.composition.save()
    .then(function(composition){
      res.status(201).json(composition);
    })
  } else res.status(403).send();
});

// delete a composition (creator of compostion & admin)
router.delete('/:compositionId', function(req, res, next) {
  if (req.user.isAdmin || req.composition.creator === req.user._id) {
    req.composition.remove()
    .then(function(){
      res.status(204).send();
    })
  } else res.status(403).send();
});

// comment subroutes for comment about the composition
router.use('/:compositionId/comments', require('./comments'));

module.exports = router;