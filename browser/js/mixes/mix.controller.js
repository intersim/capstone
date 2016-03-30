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
    MixFactory.save(meta);
  }

  $scope.changeInstr = function(selectedInstr, trackNum) {
    MixFactory.changeInstr(selectedInstr, trackNum);
  }

  $scope.open = function () {
    var detailsModal = $uibModal.open({
    animation: true,
    template: '<h1>YOU GOT THE MODAL!!!!!</h1>',
    controller: 'mixDetailsCtrl' 
  });

  }

});

app.controller('mixDetailsCtrl', function($scope){
  //do stuff in here
});

app.controller('CompViewCtrl', function($scope, MixFactory){
	$scope.mix = {
    creator: "Clyde", 
    title: "Bonnie", 
    description: "dope tunes to cause havoc to", 
    tags: ['nice'], 
    tracks: [ [], [] ]
  }
  	$scope.comments = MixFactory.getComments();
	// $scope.mix = mix;

})