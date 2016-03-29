app.factory('MixFactory', function($http, $state, $stateParams, AuthService) {

  var mix;

  var currentUser;

  console.log("welcome to MixFactory!");

  // E: these synth settings are just from Tone.js examples! Must make custom ones in future...
  var simpleSynth = new Tone.PolySynth(16, Tone.SimpleSynth, {
    "oscillator": {
      "partials": [0,2,3,4],
    },
    "volume": -12
  }).toMaster();

  var monoSynth = new Tone.PolySynth(16, Tone.MonoSynth, {
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

  instruments.track1 = simpleSynth;

  function scheduleLoop(notes, track, measure) {
    notes.forEach(function(note) {
      var scheduleTime;
      scheduleTime = note.startTime.split(":");
      scheduleTime[0] = measure;
      scheduleTime = scheduleTime.join(":");
      var trackNum = Number(track) + 1;
      Tone.Transport.schedule(function(){
        instruments["track"+trackNum].triggerAttackRelease(note.pitch, note.duration);
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
    console.log("changeInstr track: ", track);
    var trackNum = Number(track) + 1;
    if (instrStr == 'synth1') instruments["track"+trackNum] = simpleSynth;
    if (instrStr == 'synth2') instruments["track"+trackNum] = monoSynth;
    if (instrStr == 'drumSynth') instruments["track"+trackNum] = drumSynth;
    console.log("instruments is now", instruments);
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

  MixFactory.addTrack = function(trackNum) {
    var newTrack = {
      measures: []
    };

    var measureCount = mix.tracks[0].measures.length;
    while (newTrack.measures.length < measureCount) newTrack.measures.push({rest: true});

    mix.tracks.push(newTrack);

    instruments["track"+trackNum] = simpleSynth;

    console.log("instruments: ", instruments);
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
    console.log("saving mix: ", mix);
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
