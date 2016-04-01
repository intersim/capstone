// app.controller('MixCtrl', function(mix) {
//   $scope.mix = mix;
// });

app.controller('MixEditor', function($scope, mix, MixFactory, $http, loopBucket, $uibModal){
  var trackCount = mix.tracks.length - 1;

  $scope.addTrack = function() {
    if (trackCount < 4) MixFactory.addTrack(trackCount);
    else console.error("Can't have more than 4 tracks!");
    trackCount++;
  };

  $scope.mix = mix;

  $scope.instruments = [
    { name: "synth1" },
    { name: "synth2" },
    { name: "drumSynth" }
  ];

  mix.tracks.forEach(function (track) {
    track.instrumentModel = $scope.instruments.filter(function(instr){
      return instr.name == track.instrument; 
    })[0];
  });


  $scope.loopBucket = loopBucket;

  $scope.playing = false;
  
  Tone.Transport.loop = false;

  $scope.togglePlay = function() {
    if ($scope.playing) {
      Tone.Transport.stop();
      $scope.playing = false;
    } else {
      Tone.Transport.start();
      $scope.playing = true;
    }
  }

  $scope.save = function(meta){
    if (meta) MixFactory.save(meta)
    else MixFactory.save();
  }

  $scope.changeInstr = function(selectedInstr, trackNum) {
    MixFactory.changeInstr(selectedInstr, trackNum);
  }

  // E: this modal is half-implemented
  $scope.open = function () {
    var detailsModal = $uibModal.open({
    animation: true,
    size: "lg",
    scope: $scope,
    templateUrl: '/js/mixes/mix.module.html'
  });

  }

});

app.controller('FinalMixCtrl', function($scope, MixFactory, finalMix){
	$scope.mix = finalMix;
  
  // E: issues here, 'req is undefined'
  // $scope.comments = MixFactory.getComments();

  // E: to play mixes:
  // get all loops from mix, get all notes, then schedule every single one of those notes on the right instrument
  // use MixFactory.getById? or write a similar but separate function
  // need to scheduleOnce!

  $scope.playing = false;

  $scope.toggleMix = function () {
    if (!$scope.playing) {
      console.log("about to schedule and play this mix: ", $scope.mix);
      $scope.playing = true;
      MixFactory.scheduleMix($scope.mix);
      Tone.Transport.start();
    } else {
      $scope.playing = false;
      Tone.Transport.stop();
    }
  }
})
