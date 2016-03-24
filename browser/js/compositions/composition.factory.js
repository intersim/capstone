app.factory('CompositionFactory', function($http) {
  var composition = {
    tracks: [
      // track1
      {
        measures: [{rest: true},{rest: true},{rest: true}],
        numVoices: 1,
        instrument: 'flute'
      },
      // track2
      {
        measures: [{rest: true}, {rest: true}, {rest: false, loop: "56f16f274852b8ef37d15429"}],
        numVoices: 1,
        instrument: 'flute'
      }
    ]
  }

  return {
    getById: function(compositionId, includeTracks) {
      return composition;
      // var uri = '/api/compositions/' + compositionId;
      // if (includeTracks) uri += "?includeTracks=true";
      // return $http.get(url).then(function(res) {
      //   composition = res.data;
      //   return composition;
      // });
    },
    addLoop: function(loop, track, measure) {
      console.log(loop, track, measure);
      while (composition.tracks[track].length <= measure) composition.tracks[track].push({rest: true});
      composition.tracks[track][measure] = {rest: false, loop: loop};
    },
    save: function(){
      return composition.save();
    }
  }
})