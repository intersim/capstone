var router = require('express').Router();
var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var Comment = mongoose.model('Comment');
var Promise = require('bluebird');

//gets all public mixes with tracks and routes
router.get('/', function(req, res, next) {
  Mix.find()
  // AW: can you just do .deepPopulate('creator tracks.measures.loop') ?
  .deepPopulate('tracks.measures.loop')
  .populate('creator')
  .exec()
  .then(function(mixes){
    // AW: if nothing is found, it'll return an empty array, which passes existence check 
    // so: if (mixes.length)
    if (mixes) res.json(mixes.map(function(mix) {
      mix.creator = mix.creator.sanitize();
      return mix;
    }));
    else res.status(404).send();
  })
  .then(null, next)
});

// create a new mix (current user, admin)
router.post('/', function(req, res, next) {
  var mix = req.body;
  mix.creator = req.user._id;
  Mix.create(mix)
  .then(function(mix) {
    res.status(201).json(mix);
  })
  .then(null, next)
});

// mix param - loop up the mix in the db
router.param('mixId', function(req, res, next) {
  Mix.findById(req.params.mixId)
  .deepPopulate('tracks.measures.loop')
  .populate('creator')
  .exec()
  .then(function(mix) {
    if (mix) {
      mix.creator = mix.creator.sanitize();
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
  if (req.user.isAdmin || req.mix.creator._id.equals(req.user._id) ){
    req.mix.set(req.body);
    req.mix.save()
    .then(function(mix){
      res.status(201).json(mix);
    })
    .then(null, next);
  } else res.status(403).send();

});

// delete a mix (creator of mix & admin)
router.delete('/:mixId', function(req, res, next) {
  if (req.user.isAdmin || req.mix.creator.equals(req.user._id)) {
    req.mix.remove()
    .then(function(){
      res.status(204).send();
    })
    .then(null, next);
  } else res.status(403).send();
});

// comment subroutes for comment about the mix
router.use('/:mixId/comments', require('./comments'));

module.exports = router;