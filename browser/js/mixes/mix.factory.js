app.factory('MixFactory', function($http, $state, $stateParams, AuthService) {

  var mix;

  var currentUser;

  // E: these synth settings are just from Tone.js examples! Must make custom ones in future...
  var synth1 = new Tone.PolySynth(16, Tone.SimpleSynth, {
    "oscillator": {
      "partials": [0,2,3,4],
    }
  }).toMaster();

  var synth2 = new Tone.PolySynth(16, Tone.MonoSynth, {
      "portamento" : 0.01,
      "oscillator" : {
        "type" : "square"
      },
      "envelope" : {
        "attack" : 0.005,
        "decay" : 0.2,
        "sustain" : 0.4,
        "release" : 0.5
      },
      "filterEnvelope" : {
        "attack" : 0.005,
        "decay" : 0.1,
        "sustain" : 0.05,
        "release" : 0.5
        // "baseFrequency" : 300,
        // "octaves" : 4
      },
      "volume": -12
    }).toMaster();

  var drumSynth = new Tone.PolySynth(16, Tone.DrumSynth).toMaster();

  var instruments = {};

  instruments.track0 = synth1;

  function scheduleLoop(notes, track, measure) {
    notes.forEach(function(note) {
      var scheduleTime;
      scheduleTime = note.startTime.split(":");
      scheduleTime[0] = measure;
      scheduleTime = scheduleTime.join(":");
      Tone.Transport.schedule(function(){
        instruments["track"+track].triggerAttackRelease(note.pitch, note.duration);
      }, scheduleTime, measure+note._id);
    })
  }

  function clearLoop(notes, track, measure) {
    notes.forEach(function(note) {
      Tone.Transport.clear(measure+note._id);
    })
  }

  var MixFactory = {};

  MixFactory.changeInstr = function (instrStr, track) {
    //E: need to pass in track and save the instrument on the track here...
    if (instrStr == 'synth1') {
      instruments["track"+track] = synth1;
      mix.tracks[track].instrument = instrStr;
    }
    if (instrStr == 'synth2') {
      instruments["track"+track] = synth2;
      mix.tracks[track].instrument = instrStr;
    }
    if (instrStr == 'drumSynth') {
      instruments["track"+track] = drumSynth;
      mix.tracks[track].instrument = instrStr;
    }
    console.log("mix: ", mix);
  }

  MixFactory.getAll = function() {
    return $http.get('/api/mixes/')
    .then(function(res) {
      return res.data;
    })
  }

  MixFactory.new = function() {
    mix = {
      title: "Untitled",
      tracks: [
        {
          measures: [],
          instrument: 'synth1'
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
          MixFactory.changeInstr(track.instrument, trackIdx);
          track.measures.forEach(function(measure, measureIdx) {
            if (!measure.rest) {
              scheduleLoop(measure.loop.notes, trackIdx, measureIdx);
            }
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

  MixFactory.addTrack = function(track) {
    var newTrack = {
      measures: [],
      instrument: 'synth1'
    };

    var measureCount = mix.tracks[0].measures.length;
    while (newTrack.measures.length < measureCount) newTrack.measures.push({rest: true});

    mix.tracks.push(newTrack);

    instruments["track"+track] = synth1;
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
    if (id==="new") {
      $http.post('/api/mixes/', mix)
      .then(function(res) { $state.go('editMix', { mixId: res.data._id } ) });
    } else {
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
