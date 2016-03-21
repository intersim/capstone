var router = require('express').Router();
var Composition = require('../../db/models/composition');

router.param('composition', function(req, res, next) {
  Composition.findById(req.params.composition)
  .then(function(composition) {
    if (composition) req.composition = composition;
    else next(new Error('failed to find composition'));
  })
  .catch(null, next)
})

router.get('/', function(req, res, next) {
  return Composition.find();
});

router.post('/', function(req, res, next) {
  var comp = new Composition(req.body);
  comp.creator = req.user;
  return comp.save();
});

router.get('/composition', function(req, res, next) {
  res.json(req.composition);
});

router.put('/composition', functino(req, res, next) {
  req.composition.set(req.body);
  req.composition.save()
  .then(function(composition){
    res.json(composition);
  })
});

router.delete('/composition', function(req, res, next) {
  return req.composition.remove();
});

module.exports = router;