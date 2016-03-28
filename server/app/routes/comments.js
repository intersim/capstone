var router = require('express').Router({mergeParams: true});
var mongoose = require('mongoose');
var Comment = mongoose.model('Comment');

// get all comments on a mix (all guests & users)
router.get('/', function() {
  Comment.find({target: req.mix._id})
  .then(function(comments) {
    res.json(comments);
  })
  .then(null, next);
});

// create a new comment on a mix (all users - author will be current user)
router.post('/', function(req, res, next) {
  var newComment = req.body;
  newComment.author = req.user._id;
  newComment.target = req.mix._id;
  Comment.create(newComment)
  .then(function(comment) {
    res.json(comment);
  })
  .then(null, next);
})

// param for individual comment
router.param('commentId', function(req, res, next) {
  Comment.findById(req.params.commentId)
  .then(function(comment) {
    if (comment) {
      req.comment = comment;
      next();
    } else next(new Error('comment not found'));
  })
});

// update a comment on a mix (author or admin)
router.put('/:commentId', function(req, res, next) {
  if (req.user.isAdmin || req.comment.author === req.user._id) {
    req.comment.set(req.body);
    req.comment.save()
    .then(function(comment){
      res.status(201).json(comment);
    })
  } else res.status(403).send();
})

// delete a comment on a mix (author, mix's creator, admin)
router.delete('/:commentId', function(req, res, next) {
  if (req.user.isAdmin || req.comment.author === req.user._id || req.mix.creator === req.user._id) {
    req.comment.delete()
    .then(function() {
      res.status(204).send();
    })
  } else res.status(403).send();
})

module.exports = router;