var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Mix = mongoose.model('Mix');
var Loop = mongoose.model('Loop');

//retrieve all users (all guests and users)
router.get('/', function(req, res, next) {
  User.find()
  .then(function(users) {
    res.json(users.map(user => user.sanitize()) );
  })
  .then(null, next);
})

//create a new user (all guests and admin)
router.post('/', function(req, res, next) {
  User.create(req.body)
  .then(function(user) {
    res.status(201).json(user.sanitize());
  })
  .then(null, next)
})

//userid param
router.param('userId', function(req, res, next) {
  User.findById(req.params.userId)
  .populate('bucket favorites')
  .then(function(user) {
    if (user) {
      req.foundUser = user; 
      next()
    } else {
      res.status(404).json();
    }
  })
  .then(null, next);
})

//retrieve user with user id (all guests and users)
router.get('/:userId', function(req, res, next) {
  res.json(req.foundUser.sanitize());
})

//update existing user (current user and admin)
router.put('/:userId', function(req, res, next) {
  req.foundUser.set(req.body);
  req.foundUser.save()
  .then(function(user) {
  res.status(201).json(user.sanitize())
  })
  .then(null, next);
});

//deletes a user (current user and admin)
router.delete('/:userId', function(req, res, next) {
  if (req.user.isAdmin || req.user._id === req.foundUser._id) {
    req.foundUser.remove()
    .then(function() {
      res.status(204).send();
    })
    .then(null, next)
  } else {
    res.status(403).send();
  }
});

//retrieve all users currently following user id (all)
router.get('/:userId/followers', function(req, res, next){
  User.find({following: {$in: [req.foundUser._id]}})
  .then(function(followers){
    res.json(followers.map(user => user.sanitize() ) )
  })
  .then(null, next)
})

//retrieves all mixes of the user (guests and users)
router.get('/:userId/mixes', function(req, res, next){
  Mix.find({creator: req.foundUser._id})
  .then(function(mixes){
    res.json(mixes)
  })
  .then(null, next)
})

//retrieves all loops created by user (guests and users)
router.get('/:userId/loops', function(req, res, next){
  Loop.find({creator: req.foundUser._id})
  .then(function(loops){
    res.json(loops)
  })
  .then(null, next)
})

router.get('/:userId/loopBucket', function(req, res, next){
  // do we need to re-find the already found user? -AP
  User.findById(req.foundUser)
  .populate('bucket')
  .then(function(populatedUser){
    res.json(populatedUser.bucket)
  })
  .then(null, next)
})


module.exports = router;