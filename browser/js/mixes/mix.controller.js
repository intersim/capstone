// app.controller('MixCtrl', function(mix) {
//   $scope.mix = mix;
// });

app.controller('MixEditor', function($scope, mix, MixFactory, $http, loopBucket){
  var trackCount = mix.tracks.length;

  $scope.addTrack = function() {
    trackCount++
    if (trackCount <= 4) MixFactory.addTrack();
    else console.error("Can't have more than 4 tracks!");
  };

  $scope.mix = mix;

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

  $scope.save = MixFactory.save;

  $scope.instruments = [
      { name: "synth1" },
      { name: "synth2" },
      { name: "drumSynth" }
    ];

  $scope.update = function(selectedInstr) {
    console.log("changed instrument!");
    console.log("selected instr: ", selectedInstr);
    // run something from mix factory to update track's instrument, and change the selected instrument
  }

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