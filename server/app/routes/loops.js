var router = require('express').Router();
var mongoose = require('mongoose');
var Loop = mongoose.model('Loop');
var User = mongoose.model('User');
var Mix = mongoose.model('Mix');

//retrieve all loops (all)
router.get('/', function(req, res, next){

  // Loop.find({isPublic: true})

  Loop.find()
  .populate('creator')
  .then(function(loops) {
    res.json(loops);
  })
  .then(null, next);
});

//create new loop (all users)
router.post('/', function(req, res, next) {
  console.log("req.body", req.body)
  req.body.creator = req.user
  var savedLoop;
  Loop.create(req.body)
  .then(function(loop) {
    savedLoop = loop;
    req.user.bucket.push(loop._id);
    return req.user.save();
  })
  .then(function(user) {
    if (!user) throw new Error('issue saving loop onto user');
    res.json(savedLoop);
  })
  .then(null, next);
});

//loop id param
router.param('loopId', function(req, res, next) {
  Loop.findById(req.params.loopId)
  .then(function(loop) {
  //   if (loop && (loop.isPublic===true || loop.creator===req.user._id) ) {
  //     req.loop = loop;
  //     next()
  //   } else next(new Error('no published loop found'));
    req.loop = loop;
    next();
  })
  .then(null, next);
})

//get individual loop (all)
router.get('/:loopId', function(req, res, next) {
  res.json(req.loop);
});

//edit loop (creator and admin)
router.put('/:loopId', function(req, res, next){
  // if ( (!req.loop.isPublic && req.user._id === req.loop.creator) || req.user.isAdmin ){
  if ( (req.user._id.toString() === req.loop.creator.toString()) || req.user.isAdmin ){
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
  if ( (!req.loop.isPublic && req.user._id.toString() === req.loop.creator.toString()) || req.user.isAdmin ) {
    req.loop.remove()
    .then(function(){
      res.status(204).send();
    })
    .then(null, next)
  } else {
    res.status(403).send()
  }
})

//get mixes containing the loop (all)
router.get('/:loopId/mixes', function(req, res, next){
  Mix.findByLoop(req.loop._id)
  .then(function(mixes){
    res.json(mixes)
  })
  .then(null, next)
})


module.exports = router;