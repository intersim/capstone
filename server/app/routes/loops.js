var router = require('express').Router();
var mongoose = require('mongoose');
var Loop = mongoose.model('Loop');
var User = mongoose.model('User');

router.get('/', function(req, res, next){
  Loop.find()
  .then(function(loops) {
    res.json(loops);
  })
  .then(null, next);
});

router.post('/', function(req, res, next) {
  Loop.create(req.body)
  .then(function(loop) {
    req.user.bucket.push(loop._id)
    req.user.save()
    res.json(loop)
  })
  .then(null, next);
});

router.param('loopId', function(req, res, next) {
  Loop.findById(req.params.loopId)
  .then(function(loop) {
    if (loop) {
      req.loop = loop;
      next()
    } else next(new Error('no loop found'));
  })
  .then(null, next);
})

router.get('/:loopId', function(req, res, next) {
  res.json(req.loop);
});

router.put('/:loopId', function(req, res, next){
  req.loop.set(req.body);
  req.loop.save()
  .then(function(loop) {
    res.status(201).json(loop);
  })
  .then(null, next);
});

router.delete('/:loopId', function(req, res, next) {
  req.loop.remove()
  .then(function(){
    res.status(204).send();
  })
  .then(null, next);
})

module.exports = router;