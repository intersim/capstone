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
  Composition.find()
  .then(function(compositions) {
    res.json(compositions);
  })
});

router.post('/', function(req, res, next) {
  var comp = new Composition(req.body);
  comp.creator = req.user;
  comp.save()
  .then(function(comp) {
    res.status(201).json(comp);
  })
});

router.get('/composition', function(req, res, next) {
  res.json(req.composition);
});

router.put('/composition', functino(req, res, next) {
  req.composition.set(req.body);
  req.composition.save()
  .then(function(composition){
    res.status(201).json(composition);
  })
});

router.delete('/composition', function(req, res, next) {
  req.composition.remove()
  .then(function(){
    res.status(204).send();
  })
});

module.exports = router;