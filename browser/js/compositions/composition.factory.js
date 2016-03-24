app.factory('CompositionFactory', function($http) {
  var composition = {
    tracks: [
      // track1
      {
        measures: [{rest: true},{rest: true},{rest: true}, {rest:true}],
        numVoices: 1,
        instrument: 'flute'
      },
      // track2
      {
        measures: [{rest: true}, {rest: true}, {rest: false, loop: "56f16f274852b8ef37d15429"}, {rest:true}],
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
      // return $http.get(uri).then(function(res) {
      //   composition = res.data;
      //   return composition;
      // });
    },
    addLoop: function(loop, track, measure) {
      var measures = composition.tracks[track].measures;
      console.log('should add to: ', track, measure);
      console.log('should add the loop to', measures);
      while (measures.length <= measure) measures.push({rest: true});
      measures[measure] = { rest: false, loop: loop };
      console.log(composition.tracks)
    },
    removeLoop: function(track, measure) {
      composition.tracks[track].measures[measure] = { rest: true };
      console.log(composition.tracks);
    },
    save: function(){
      return composition.save();
    },
        //returns an array of objects
    getCommentsById: function(targetId) {
      var uri = '/api/comments/' + targetId;
      return $http.get(uri).then(function(res) { return res.data; });
    }
  }
})