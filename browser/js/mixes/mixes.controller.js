'use strict';

app.controller('MixesCtrl', function($scope, mixes){

  $scope.selected = null;

  $scope.mixes = mixes;

  $scope.select = function(mix) {
    var loops = [];
    mix.tracks.forEach(function(track) {
      track.measures.forEach(function(measure) {
        if (measure.loop) loops.push(measure.loop);
      })
    })
    mix.loops = loops;
    $scope.selected = mix;
  }

})