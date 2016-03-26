app.factory('CompositionFactory', function($http, $state, $stateParams) {
  // var composition = {
  //   tracks: [
  //     // track1
  //     {
  //       measures: [
  //         {rest: true},
  //         {rest: true},
  //         {rest: true},
  //         {rest:true}
  //       ],
  //       numVoices: 1,
  //       instrument: 'flute'
  //     },
  //     // track2
  //     {
  //       measures: [{rest: true}, {rest: true}, {
  //         rest: false, 
  //         loop: {
  //             _id: "56f16f274852b8ef37d15429",
  //             notes: [
  //               {"pitch":"b4","duration":"8n","startTime":"0:1:0", _id: "56f16f274852b8ef37d1542e"},
  //               {"pitch":"a4","duration":"8n","startTime":"0:2:0", _id: "56f16f274852b8ef37d1542d"},
  //               {"pitch":"b4","duration":"8n","startTime":"0:3:2", _id: "56f16f274852b8ef37d1542c"},
  //               {"pitch":"b4","duration":"8n","startTime":"0:0:2", _id: "56f16f274852b8ef37d1542b"},
  //               {"pitch":"g4","duration":"8n","startTime":"0:2:2", _id: "56f16f274852b8ef37d1542a"}
  //            ]
  //           }
  //         },
  //         {rest:true}
  //       ],
  //       numVoices: 1,
  //       instrument: 'flute'
  //     }
  //   ]
  // }

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

  return {
    new: function() {
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
    },
    getById: function(compositionId, includeTracks) {
        var uri = '/api/compositions/' + compositionId;
        if (includeTracks) {
          uri += "?includeTracks=true";
        }
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
    },
    addLoop: function(loopId, track, measure) {
      var measures = composition.tracks[track].measures;
      while (measures.length <= measure) measures.push({rest: true});
      measures[measure] = { rest: false, loop: {_id: loopId} };
      $http.get('/api/loops/' + loopId)
        .then(function(res) {
          var loop = res.data;
          scheduleLoop(loop.notes, track, measure);  
        })

    },
    removeLoop: function(track, measure) {
      composition.tracks[track].measures[measure] = { rest: true };
    },
    save: function(){
      var id = $stateParams.compositionId;
      if ( id === 'new' ) {
        $http.post('/api/compositions', composition)
        .then(function(res) { $state.go('editComposition', {compositionId: res.data._id} ) });
      } else $http.put('/api/compositions/' + id, composition);
    },
    //returns an array of objects
    getCommentsById: function(targetId) {
      var uri = '/api/comments/' + targetId;
      return $http.get(uri).then(function(res) { return res.data; });
    },

    getByCreator: function(userid){
      var url = '/api/compositions/of/' +userid;
      return $http.get(url)
      .then(response => response.data)
    }
  }
})