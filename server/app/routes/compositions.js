var router = require('express').Router();
var mongoose = require('mongoose');
var Composition = mongoose.model('Composition');
var Comment = mongoose.model('Comment');
var Promise = require('bluebird');

router.get('/', function(req, res, next) {
  var query = Composition.find();
  if (req.query.includeTracks) query = query.populate('tracks');
  query.exec()
  .then(function(compositions) {
    if (compositions) res.json(compositions);
    else res.status(404).send();
  })
  .then(null, next);
});

router.post('/', function(req, res, next) {
  var composition = req.body;
  // Promise.map( composition.tracks, function(track) {
  //   return mongoose.model('Track').create(track);
  // } )
  mongoose.model('Track')
  .create(composition.tracks[0])
  .then(function(track) {
    composition.tracks = [track];
  })
  .then(function() {
    var newComposition = new Composition(req.body);
    // comp.creator = req.user;
    return newComposition.save()
  })
  .then(function(composition) {
    res.status(201).json(composition);
  })
  .then(null, function(err) {
    console.log("ERRROORRR")
    console.error(err.stack);
    res.status(404).send();
  })
});

router.param('compositionId', function(req, res, next) {
  var query = Composition.findById(req.params.compositionId);
  if (req.query.includeTracks) query = query.populate('tracks');
  query.exec()
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

router.get('/:compositionId', function(req, res, next) {
  res.json(req.composition);
});

router.get('/of/:userid', function(req, res, next){
  Composition.find({creator:req.params.userid})
  .then(function(compositions){
    res.json(compositions)
  })
  .then(null, next)
})

router.put('/:compositionId', function(req, res, next) {
  req.composition.set(req.body);
  req.composition.save()
  .then(function(composition){
    res.status(201).json(composition);
  })
});

router.delete('/:compositionId', function(req, res, next) {
  req.composition.remove()
  .then(function(){
    res.status(204).send();
  })
});

router.use('/:compositionId/tracks', require('./tracks') );

router.get('/:compositionId/comments', function(req, res, next) {
  Comment.find({target: req.params.compositionId})
  .then(function(comments) {
    res.json(comments);
  })
  .then(null, next);
});

module.exports = router;