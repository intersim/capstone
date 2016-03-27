app.factory('CompositionFactory', function($http, $state, $stateParams) {

  var composition;

  var instrument = new Tone.PolySynth(16, Tone.SimpleSynth, {
    "oscillator": {
      "partials": [0,2,3,4],
    },
    "volume": -12
  }).toMaster();

  function scheduleLoop(notes, track, measure) {
    notes.forEach(function(note) {
      note.startTime = note.startTime.split(":");
      note.startTime[0] = measure;
      note.startTime = note.startTime.join(":");
      Tone.Transport.schedule(function(){
        console.log("note scheduled: ", note);
        instrument.triggerAttackRelease(note.pitch, note.duration);
      }, note.startTime, note._id);
    })
  }

  Tone.Transport.loop = false;

  var CompositionFactory = {};

  CompositionFactory.getAll = function() {
    return $http.get('/api/compositions', function(res) {
      return res.data;
    })
  }

  CompositionFactory.new = function() {
    composition = {
      title: "Untitled",
      tracks: [
        {
          measures: []
        }
      ]
    }
    while (composition.tracks[0].measures.length < 16) composition.tracks[0].measures.push({rest:true});
    return composition;
  }

  CompositionFactory.getById =function(compositionId) {
      var uri = '/api/compositions/' + compositionId;
      return $http.get(uri)
        .then(function(res) {
        composition = res.data;
        composition.tracks.forEach(function(track, trackIdx) {
          track.measures.forEach(function(measure, measureIdx) {
            if (!measure.rest) scheduleLoop(measure.loop.notes, trackIdx, measureIdx)
          })
        })
        return composition;
      });
  }

  CompositionFactory.addLoop = function(loopId, track, measure) {
    console.log("adding loop!");
    console.log("addLoop info: ", loopId, track, measure);
    var measures = composition.tracks[track].measures;
    while (measures.length <= measure) measures.push({rest: true});
    measures[measure] = { rest: false, loop: {_id: loopId} };
    //issues here?
    $http.get('/api/loops/' + loopId)
      .then(function(res) {
        console.log("CompFactory GET that loop");
        var loop = res.data;
        scheduleLoop(loop.notes, track, measure);  
      });

  }

  CompositionFactory.removeLoop = function(track, measure) {
    composition.tracks[track].measures[measure] = { rest: true };
  }
  
  CompositionFactory.save = function(){
    var id = $stateParams.compositionId;
    if ( id === 'new' ) {
      $http.post('/api/compositions', composition)
      .then(function(res) { $state.go('editComposition', {compositionId: res.data._id} ) });
    } else $http.put('/api/compositions/' + id, composition);
  }
    
  CompositionFactory.delete = function() {
    return $http.delete('/api/compositions/' + $stateParams.compositionId)
      .then(function(res) {
        return res.data;
      })
  }

  CompositionFactory.getComments = function() {
    return $http.get('/api/compositions/' + $stateParams.compositionId + '/comments')
      .then(function(res) {
        return res.data;
      });
  }

  CompositionFactory.addComment = function(commentData) {
    return $http.post('/api/compositions/' + $stateParams.compositionId + '/comments', commentData)
      .then(function(res) {
        return res.data;
      })
  }

  CompositionFactory.updateComment = function(commentData) {
    return $http.put('/api/compositions/' + $stateParams.compositionId + '/comments/' + commentId, commentData)
      .then(function(res) {
        return res.data;
      })
  }

  CompositionFactory.deleteComment = function(commentId) {
    return $http.delete('/api/compositions/' + $stateParams.compositionId + '/comments/' + commentId)
      .then(function(res) {
        return res.data;
      })
  }

  return CompositionFactory;

})
