'use strict';
var router = require('express').Router();
module.exports = router;

router.use('/', function(req, res, next){
  if(!req.headers.referer) {
    var err = new Error('Action not permitted');
    err.status = 403;
    next(err);
  }
});

router.use('/comments', require('./comments'));
router.use('/mixes', require('./mixes'));
router.use('/loops', require('./loops'));
router.use('/users', require('./users'));

// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});

