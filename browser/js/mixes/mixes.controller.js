'use strict';

app.controller('MixesCtrl', function($scope, mixes, MixFactory){

  $scope.selected = null;

  $scope.mixes = mixes;

  $scope.select = function(mix) {
    console.log(mix);
    var loops = [];
    mix.tracks.forEach(function(track) {
      track.measures.forEach(function(measure) {
        if (measure.loop) loops.push(measure.loop);
      })
    })
    mix.loops = loops;
    $scope.selected = mix;
  }

  // E: to play mixes:
  // get all loops from mix, get all notes, then schedule every single one of those notes on the right instrument
  // use MixFactory.getById? or write a similar but separate function
  // need to scheduleOnce!

  $scope.playing = false;

  $scope.toggleMix = function (mix) {
    if (!$scope.playing) {
      console.log("about to schedule and play this mix: ", mix);
      $scope.playing = true;
      MixFactory.scheduleMix(mix);
      Tone.Transport.start();
    } else {
      $scope.playing = false;
      Tone.Transport.stop();
    }
  }


})