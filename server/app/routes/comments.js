var router = require('express').Router();
var mongoose = require('mongoose');
var Comment = mongoose.model('Comment');

router.post('/', function(req, res, next) {
  Comment.create(req.body)
  .then(function(comment) {
    res.json(comment);
  })
  .then(null, next);
})

router.param('commentId', function(req, res, next) {
  Comment.findById(req.params.commentId)
  .then(function(comment) {
    if (comment) {
      req.comment = comment;
      next();
    } else next(new Error('comment not found'));
  })
});

router.put('/:commentId', function(req, res, next) {
  if (req.comment.author === req.user._id) {
    req.comment.set(req.body);
    req.comment.save()
    .then(function(comment){
      res.status(201).json(comment);
    })
  } else res.status(403).send();
})

router.delete('/:commentId', function(req, res, next) {
  if (req.comment.author === req.user._id) {
    req.comment.delete()
    .then(function() {
      res.status(204).send();
    })
  } else res.status(403).send();
})

module.exports = router;