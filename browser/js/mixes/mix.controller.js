// app.controller('MixCtrl', function(mix) {
//   $scope.mix = mix;
// });

app.controller('MixEditor', function($scope, mix, MixFactory, $http, loopBucket){
  var trackCount = mix.tracks.length;
  console.log("this mix's trackCount: ", trackCount);

  $scope.addTrack = function() {
    var newTrackNum = trackCount++;
    MixFactory.addTrack(newTrackNum);
    // need to digest here?
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