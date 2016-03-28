'use strict';
var router = require('express').Router();
module.exports = router;

router.use('/comments', require('./comments'));
router.use('/mixes', require('./mixes'));
router.use('/loops', require('./loops'));
router.use('/users', require('./users'));

// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});

