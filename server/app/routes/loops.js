var router = require('express').Router();
var mongoose = require('mongoose');
var Loop = mongoose.model('Loop');
var User = mongoose.model('User');
var Composition = mongoose.model('Composition');

//retrieve all loops (all)
router.get('/', function(req, res, next){
  Loop.find({isPublic: true})
  .then(function(loops) {
    res.json(loops);
  })
  .then(null, next);
});

//create new loop (all users)
router.post('/', function(req, res, next) {
  console.log('req.body', req.body)
  req.body.creator = req.user
  console.log('req.body after addition', req.body)
  Loop.create(req.body)
  .then(function(loop) {
    console.log('just created a loop', loop)
    req.user.bucket.push(loop._id)
    req.user.save()
    res.json(loop)
  })
  .then(null, next);
});

//loop id param
router.param('loopId', function(req, res, next) {
  Loop.findById(req.params.loopId)
  .then(function(loop) {
    if (loop && (loop.isPublic===true || loop.creator===req.user._id) ) {
      req.loop = loop;
      next()
    } else next(new Error('no published loop found'));
  })
  .then(null, next);
})

//get individual loop (all)
router.get('/:loopId', function(req, res, next) {
  res.json(req.loop);
});

//edit loop (creator and admin)
router.put('/:loopId', function(req, res, next){
  if ( (!req.loop.isPublic && req.user._id === req.loop.creator) || req.user.isAdmin ){
    req.loop.set(req.body);
    req.loop.save()
    .then(function(loop) {
      res.status(201).json(loop);
    })
    .then(null, next)
  } else {
    res.status(403).send()
  }
});

//delete loop (creator and admin)
router.delete('/:loopId', function(req, res, next) {
  if ( (!req.loop.isPublic && req.user._id === req.loop.creator) || req.user.isAdmin ) {
    req.loop.remove()
    .then(function(){
      res.status(204).send();
    })
    .then(null, next)
  } else {
    res.status(403).send()
  }
})

//get compositions containing the loop (all)
router.get('/:loopId/compositions', function(req, res, next){
  Composition.findByLoop(req.loop._id)
  .then(function(compositions){
    res.json(compositions)
  })
  .then(null, next)
})


module.exports = router;