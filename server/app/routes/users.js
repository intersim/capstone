var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');

router.get('/', function(req, res, next) {
  User.find()
  .then(function(users) {
    res.json(users);
  })
  .then(null, next);
})

router.post('/', function(req, res, next) {
  User.create(req.body)
  .then(function(user) {
    res.status(201).json(user);
  })
  .then(null, next)
})


router.param('userId', function(req, res, next) {
  User.findById(req.params.userId)
  .then(function(user) {
    if (user) {
      req.foundUser = user;
      next()
    } else {
      next(new Error('couldn\'t find user'));
    }
  })
})

router.get('/:userId', function(req, res, next) {
  res.json(req.foundUser);
})

router.get('/:userId/followers', function(req, res, next){
  User.find({following: {$in: [req.params.userId]}})
  .then(function(followers){
    res.json(followers)
  })
  .then(null, next)
})

router.put('/:userId', function(req, res, next) {
  req.foundUser.set(req.body);
  req.foundUser.save()
  .then(function(user) {
    res.status(201).json(user)
  })
  .then(null, next);
});

router.put('/follow/:fid', function(req, res, next){
  req.user.following.push(req.params.fid)
  console.log("ID", req.params.fid)
  req.user.save()
  .then(function(){
    res.status(201)
  })
  .then(null, next)
})

router.put('/addloop/:lid', function(req, res, next){
  req.user.bucket.push(req.params.lid)
  req.user.save()
  .then(function(){
    res.status(201)
  })
  .then(null, next)
})

router.delete('/:userId', function(req, res, next) {
  if (req.user.isAdmin || req.user._id === userId) {
    req.foundUser.remove()
    .then(function() {
      res.status(204).send();
    })
  } else {
    res.status(403).send();
  }
});

module.exports = router;