app.factory('MixFactory', function($http, $state, $stateParams, AuthService) {

  var mix;

  var currentUser;

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
        instrument.triggerAttackRelease(note.pitch, note.duration);
      }, note.startTime, measure+note._id);
    })
  }

  function clearLoop(notes, track, measure) {
    notes.forEach(function(note) {
      Tone.Transport.clear(measure+note._id);
    })
  }

  Tone.Transport.loop = false;

  var MixFactory = {};

  MixFactory.getAll = function() {
    return $http.get('/api/mixes/', function(res) {
      return res.data;
    })
  }

  MixFactory.new = function() {
    mix = {
      title: "Untitled",
      tracks: [
        {
          measures: []
        }
      ]
    }
    while (mix.tracks[0].measures.length < 16) mix.tracks[0].measures.push({rest:true});

    AuthService.getLoggedInUser()
    .then(function (loggedInUser) {
      mix.creator = loggedInUser;
    });

    return mix;
  }

  MixFactory.getById =function(mixId) {
      var uri = '/api/mixes/' + mixId;
      return $http.get(uri)
        .then(function(res) {
        mix = res.data;
        mix.tracks.forEach(function(track, trackIdx) {
          track.measures.forEach(function(measure, measureIdx) {
            if (!measure.rest) scheduleLoop(measure.loop.notes, trackIdx, measureIdx)
          })
        })
        return mix;
      });
  }

  MixFactory.addLoop = function(loopId, track, measure) {
    var measures = mix.tracks[track].measures;
    while (measures.length <= measure) measures.push({rest: true});
    measures[measure] = { rest: false, loop: {_id: loopId} };
    $http.get('/api/loops/' + loopId)
      .then(function(res) {
        var loop = res.data;
        scheduleLoop(loop.notes, track, measure);  
      });
  }

  MixFactory.removeLoop = function(loopId, track, measure) {
    mix.tracks[track].measures[measure] = { rest: true };
    $http.get('/api/loops/' + loopId)
      .then(function(res) {
        var loop = res.data;
        clearLoop(loop.notes, track, measure);  
      });    
  }
  
  MixFactory.save = function(){
    var id = $stateParams.mixId;
    if (!id) {
      $http.post('/api/mixes/', mix)
      .then(function(res) { $state.go('editMix', {mixId: res.data._id} ) });
    } else {
      console.log("saving mix.tracks[0]: ", mix.tracks[0]);
      $http.put('/api/mixes/' + id, mix);  
    }
  }
    
  MixFactory.delete = function() {
    return $http.delete('/api/mixes/' + $stateParams.mixId)
      .then(function(res) {
        return res.data;
      })
  }

  MixFactory.getComments = function() {
    return $http.get('/api/mixes/' + $stateParams.mixId + '/comments')
      .then(function(res) {
        return res.data;
      });
  }

  MixFactory.addComment = function(commentData) {
    return $http.post('/api/mixes/' + $stateParams.mixId + '/comments', commentData)
      .then(function(res) {
        return res.data;
      })
  }

  MixFactory.updateComment = function(commentData) {
    return $http.put('/api/mixes/' + $stateParams.mixId + '/comments/' + commentId, commentData)
      .then(function(res) {
        return res.data;
      })
  }

  MixFactory.deleteComment = function(commentId) {
    return $http.delete('/api/mixes/' + $stateParams.mixId + '/comments/' + commentId)
      .then(function(res) {
        return res.data;
      })
  }

  return MixFactory;

})
